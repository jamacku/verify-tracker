import { z } from 'zod';
export declare const singleCommitMetadataSchema: z.ZodObject<{
    sha: z.ZodString;
    url: z.ZodString;
    message: z.ZodObject<{
        title: z.ZodString;
        body: z.ZodString;
        cherryPick: z.ZodArray<z.ZodObject<{
            sha: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            sha: string;
        }, {
            sha: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        title: string;
        body: string;
        cherryPick: {
            sha: string;
        }[];
    }, {
        title: string;
        body: string;
        cherryPick: {
            sha: string;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    sha: string;
    url: string;
    message: {
        title: string;
        body: string;
        cherryPick: {
            sha: string;
        }[];
    };
}, {
    sha: string;
    url: string;
    message: {
        title: string;
        body: string;
        cherryPick: {
            sha: string;
        }[];
    };
}>;
export type SingleCommitMetadata = z.infer<typeof singleCommitMetadataSchema>;
export declare const commitMetadataSchema: z.ZodArray<z.ZodObject<{
    sha: z.ZodString;
    url: z.ZodString;
    message: z.ZodObject<{
        title: z.ZodString;
        body: z.ZodString;
        cherryPick: z.ZodArray<z.ZodObject<{
            sha: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            sha: string;
        }, {
            sha: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        title: string;
        body: string;
        cherryPick: {
            sha: string;
        }[];
    }, {
        title: string;
        body: string;
        cherryPick: {
            sha: string;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    sha: string;
    url: string;
    message: {
        title: string;
        body: string;
        cherryPick: {
            sha: string;
        }[];
    };
}, {
    sha: string;
    url: string;
    message: {
        title: string;
        body: string;
        cherryPick: {
            sha: string;
        }[];
    };
}>, "many">;
export type CommitMetadata = z.infer<typeof commitMetadataSchema>;
export declare const pullRequestMetadataSchema: z.ZodObject<{
    number: z.ZodNumber;
    base: z.ZodString;
    ref: z.ZodString;
    commits: z.ZodArray<z.ZodObject<{
        sha: z.ZodString;
        url: z.ZodString;
        message: z.ZodObject<{
            title: z.ZodString;
            body: z.ZodString;
            cherryPick: z.ZodArray<z.ZodObject<{
                sha: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                sha: string;
            }, {
                sha: string;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            title: string;
            body: string;
            cherryPick: {
                sha: string;
            }[];
        }, {
            title: string;
            body: string;
            cherryPick: {
                sha: string;
            }[];
        }>;
    }, "strip", z.ZodTypeAny, {
        sha: string;
        url: string;
        message: {
            title: string;
            body: string;
            cherryPick: {
                sha: string;
            }[];
        };
    }, {
        sha: string;
        url: string;
        message: {
            title: string;
            body: string;
            cherryPick: {
                sha: string;
            }[];
        };
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    number: number;
    base: string;
    ref: string;
    commits: {
        sha: string;
        url: string;
        message: {
            title: string;
            body: string;
            cherryPick: {
                sha: string;
            }[];
        };
    }[];
}, {
    number: number;
    base: string;
    ref: string;
    commits: {
        sha: string;
        url: string;
        message: {
            title: string;
            body: string;
            cherryPick: {
                sha: string;
            }[];
        };
    }[];
}>;
export type PullRequestMetadata = z.infer<typeof pullRequestMetadataSchema>;
