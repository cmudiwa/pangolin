import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { db } from "@server/db";
import { resources, roleResources, roleSites } from "@server/db/schema";
import { and, eq } from "drizzle-orm";
import response from "@server/utils/response";
import HttpCode from "@server/types/HttpCode";
import createHttpError from "http-errors";
import { ActionsEnum, checkUserActionPermission } from "@server/auth/actions";
import logger from "@server/logger";
import { fromError } from "zod-validation-error";

const removeRoleSiteParamsSchema = z.object({
    roleId: z.string().transform(Number).pipe(z.number().int().positive()),
});

const removeRoleSiteSchema = z.object({
    siteId: z.string().transform(Number).pipe(z.number().int().positive()),
});

export async function removeRoleSite(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    try {
        const parsedParams = removeRoleSiteSchema.safeParse(req.params);
        if (!parsedParams.success) {
            return next(
                createHttpError(
                    HttpCode.BAD_REQUEST,
                    fromError(parsedParams.error).toString()
                )
            );
        }

        const { siteId } = parsedParams.data;

        const parsedBody = removeRoleSiteParamsSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return next(
                createHttpError(
                    HttpCode.BAD_REQUEST,
                    fromError(parsedBody.error).toString()
                )
            );
        }

        const { roleId } = parsedBody.data;

        // Check if the user has permission to remove role sites
        const hasPermission = await checkUserActionPermission(
            ActionsEnum.removeRoleSite,
            req
        );
        if (!hasPermission) {
            return next(
                createHttpError(
                    HttpCode.FORBIDDEN,
                    "User does not have permission to perform this action"
                )
            );
        }

        const deletedRoleSite = await db
            .delete(roleSites)
            .where(
                and(eq(roleSites.roleId, roleId), eq(roleSites.siteId, siteId))
            )
            .returning();

        if (deletedRoleSite.length === 0) {
            return next(
                createHttpError(
                    HttpCode.NOT_FOUND,
                    `Site with ID ${siteId} not found for role with ID ${roleId}`
                )
            );
        }

        const siteResources = await db
            .select()
            .from(resources)
            .where(eq(resources.siteId, siteId));

        for (const resource of siteResources) {
            await db
                .delete(roleResources)
                .where(
                    and(
                        eq(roleResources.roleId, roleId),
                        eq(roleResources.resourceId, resource.resourceId)
                    )
                )
                .returning();
        }

        return response(res, {
            data: null,
            success: true,
            error: false,
            message: "Site removed from role successfully",
            status: HttpCode.OK,
        });
    } catch (error) {
        logger.error(error);
        return next(
            createHttpError(
                HttpCode.INTERNAL_SERVER_ERROR,
                "An error occurred..."
            )
        );
    }
}
