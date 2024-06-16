/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Health check */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: components["responses"]["Ok"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Register a new User */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @example mike@gmail.com */
                        email: string;
                        /** @example mike11 */
                        username: string;
                        /** @example password123 */
                        password: string;
                    };
                };
            };
            responses: {
                201: components["responses"]["Created"];
                400: components["responses"]["BadRequest"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Login as a User */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @example mike11 */
                        username: string;
                        /** @example password123 */
                        password: string;
                    };
                };
            };
            responses: {
                /** @description Successfully logged in */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["UserDetails"];
                    };
                };
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
                404: components["responses"]["NotFound"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/authed/avatars": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get default avatars and the user's current avatar */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default avatars and current avatar */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            defaultAvatars: components["schemas"]["Avatar"][];
                            /** @example avatar-1 */
                            currentAvatar: string;
                        };
                    };
                };
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/authed/setAvatar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Set an avatar for a User */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @example avatar-1 */
                        avatar: string;
                    };
                };
            };
            responses: {
                200: components["responses"]["Ok"];
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
                404: components["responses"]["NotFound"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/authed/chatHeads": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get chat heads for a given user */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Successfully got chat heads */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatHead"][];
                    };
                };
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/authed/messages/{threadId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get messages for a specified thread */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description ID of the thread to get messages from */
                    threadId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Successfully got messages */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Message"][];
                    };
                };
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/authed/userHeads": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get user heads for a given user */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Successfully got user heads */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["UserDetails"][];
                    };
                };
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/authed/message": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Send a message to a specified chat thread */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @example [
                         *       1,
                         *       2
                         *     ] */
                        members: number[];
                        /** @example lorem ipsum */
                        content: string;
                    };
                };
            };
            responses: {
                200: components["responses"]["Ok"];
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/authed/readThread/{threadId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Mark a specified thread as read */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description ID of the thread to be marked as read */
                    threadId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: components["responses"]["Ok"];
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
                404: components["responses"]["NotFound"];
            };
        };
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        Avatar: {
            /** @example avatar-1 */
            name: string;
            /** @example www.avatar-1.com */
            url: string;
        };
        ChatHead: {
            /** @example 1 */
            conversationId: number;
            /** @example 1 */
            threadId: number;
            /** @example 1 */
            unseenMessageId?: number;
            avatar: components["schemas"]["Avatar"];
            message: components["schemas"]["Message"];
        };
        UserDetails: {
            /** @example 1 */
            userId: number;
            /** @example mike11 */
            username: string;
            avatar: components["schemas"]["Avatar"];
        };
        Message: {
            /** @example 1 */
            messageId: number;
            /** @example 1 */
            fromUserId: number;
            /** @example 2024-03-15T10:01:00Z */
            createdAt: string;
            /** @example lorem ipsum */
            content: string;
        };
    };
    responses: {
        /** @description Successful response */
        Ok: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    /** @example Request was successful. */
                    message: string;
                };
            };
        };
        /** @description Resource created successfully */
        Created: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    /** @example Resource created successfully. */
                    message: string;
                };
            };
        };
        /** @description Bad request */
        BadRequest: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    /** @example Invalid request parameters. */
                    error: string;
                };
            };
        };
        /** @description Unauthorized access */
        Unauthorized: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    /** @example Authentication is required. */
                    error: string;
                };
            };
        };
        /** @description Resource not found */
        NotFound: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    /** @example Resource not found. */
                    error: string;
                };
            };
        };
    };
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
