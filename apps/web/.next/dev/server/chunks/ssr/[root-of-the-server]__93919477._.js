module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/apps/web/src/lib/api/client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "apiClient",
    ()=>apiClient
]);
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
class ApiClient {
    accessToken = null;
    refreshToken = null;
    constructor(){
        // Load tokens from localStorage on init (client-side only)
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }
    setTokens(accessToken, refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }
    clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }
    getAccessToken() {
        return this.accessToken;
    }
    async request(endpoint, options = {}) {
        const { method = 'GET', body, headers = {}, auth = true } = options;
        const requestHeaders = {
            'Content-Type': 'application/json',
            ...headers
        };
        if (auth && this.accessToken) {
            requestHeaders['Authorization'] = `Bearer ${this.accessToken}`;
        }
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method,
                headers: requestHeaders,
                body: body ? JSON.stringify(body) : undefined
            });
            const data = await response.json();
            if (!response.ok) {
                // Try to refresh token if unauthorized
                if (response.status === 401 && this.refreshToken && auth) {
                    const refreshed = await this.tryRefreshToken();
                    if (refreshed) {
                        // Retry the request with new token
                        return this.request(endpoint, options);
                    }
                }
                return data;
            }
            return data;
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: error instanceof Error ? error.message : 'Network error occurred'
                }
            };
        }
    }
    async tryRefreshToken() {
        if (!this.refreshToken) return false;
        try {
            const response = await fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`
                },
                body: JSON.stringify({
                    refreshToken: this.refreshToken
                })
            });
            if (!response.ok) {
                this.clearTokens();
                return false;
            }
            const data = await response.json();
            if (data.success && data.data?.tokens) {
                this.setTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
                return true;
            }
            this.clearTokens();
            return false;
        } catch  {
            this.clearTokens();
            return false;
        }
    }
    // Auth endpoints
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: {
                email,
                password
            },
            auth: false
        });
    }
    async register(email, name, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: {
                email,
                name,
                password
            },
            auth: false
        });
    }
    async googleAuth(credential) {
        return this.request('/auth/google', {
            method: 'POST',
            body: {
                credential
            },
            auth: false
        });
    }
    async getGoogleConfig() {
        return this.request('/auth/google/config', {
            method: 'GET',
            auth: false
        });
    }
    async logout() {
        if (!this.refreshToken) return;
        await this.request('/auth/logout', {
            method: 'POST',
            body: {
                refreshToken: this.refreshToken
            }
        });
        this.clearTokens();
    }
    async getMe() {
        return this.request('/auth/me');
    }
    // Scrape endpoints
    async scrape(params) {
        return this.request('/v1/scrape', {
            method: 'POST',
            body: params
        });
    }
    // AI-powered extraction
    async extract(params) {
        return this.request('/v1/scrape/extract', {
            method: 'POST',
            body: params
        });
    }
    // Auto-detect extractable data
    async detect(url, renderMode = 'http') {
        return this.request('/v1/scrape/detect', {
            method: 'POST',
            body: {
                url,
                renderMode
            }
        });
    }
    // Get AI provider status
    async getAIStatus() {
        return this.request('/v1/scrape/ai/status');
    }
    // Export scrape data
    async exportData(params, format) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v1/scrape/export/${format}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`
            },
            body: JSON.stringify(params)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Export failed');
        }
        return response.blob();
    }
    async getJob(jobId) {
        return this.request(`/v1/jobs/${jobId}`);
    }
    async listJobs(page = 1, limit = 20) {
        return this.request(`/v1/jobs?page=${page}&limit=${limit}`);
    }
    // API Keys endpoints
    async listApiKeys() {
        return this.request('/api-keys');
    }
    async createApiKey(name, permissions) {
        return this.request('/api-keys', {
            method: 'POST',
            body: {
                name,
                permissions
            }
        });
    }
    async deleteApiKey(id) {
        return this.request(`/api-keys/${id}`, {
            method: 'DELETE'
        });
    }
    // Usage endpoints
    async getUsage(startDate, endDate) {
        const params = new URLSearchParams();
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
        return this.request(`/v1/usage?${params.toString()}`);
    }
}
const apiClient = new ApiClient();
}),
"[project]/apps/web/src/contexts/auth-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$1$2b$df4bf79bce1f90fc$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.1.1+df4bf79bce1f90fc/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$1$2b$df4bf79bce1f90fc$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.1.1+df4bf79bce1f90fc/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/api/client.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
const AuthContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$1$2b$df4bf79bce1f90fc$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"](undefined);
function AuthProvider({ children }) {
    const [user, setUser] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$1$2b$df4bf79bce1f90fc$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](null);
    const [isLoading, setIsLoading] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$1$2b$df4bf79bce1f90fc$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](true);
    const isAuthenticated = !!user;
    const refreshUser = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$1$2b$df4bf79bce1f90fc$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"](async ()=>{
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].getAccessToken()) {
            setUser(null);
            setIsLoading(false);
            return;
        }
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].getMe();
            if (response.success && response.data?.user) {
                setUser(response.data.user);
            } else {
                setUser(null);
                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].clearTokens();
            }
        } catch  {
            setUser(null);
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].clearTokens();
        } finally{
            setIsLoading(false);
        }
    }, []);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$1$2b$df4bf79bce1f90fc$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        refreshUser();
    }, [
        refreshUser
    ]);
    const login = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$1$2b$df4bf79bce1f90fc$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"](async (email, password)=>{
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].login(email, password);
        if (response.success && response.data) {
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
            setUser(response.data.user);
            return {
                success: true
            };
        }
        return {
            success: false,
            error: response.error?.message || "Login failed"
        };
    }, []);
    const register = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$1$2b$df4bf79bce1f90fc$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"](async (email, name, password)=>{
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].register(email, name, password);
        if (response.success && response.data) {
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
            setUser(response.data.user);
            return {
                success: true
            };
        }
        return {
            success: false,
            error: response.error?.message || "Registration failed"
        };
    }, []);
    const googleLogin = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$1$2b$df4bf79bce1f90fc$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"](async (credential)=>{
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].googleAuth(credential);
        if (response.success && response.data) {
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
            setUser(response.data.user);
            return {
                success: true
            };
        }
        return {
            success: false,
            error: response.error?.message || "Google login failed"
        };
    }, []);
    const logout = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$1$2b$df4bf79bce1f90fc$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"](async ()=>{
        await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].logout();
        setUser(null);
    }, []);
    const value = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$1$2b$df4bf79bce1f90fc$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"](()=>({
            user,
            isLoading,
            isAuthenticated,
            login,
            register,
            googleLogin,
            logout,
            refreshUser
        }), [
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        googleLogin,
        logout,
        refreshUser
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$1$2b$df4bf79bce1f90fc$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/web/src/contexts/auth-context.tsx",
        lineNumber: 101,
        columnNumber: 10
    }, this);
}
function useAuth() {
    const context = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$1$2b$df4bf79bce1f90fc$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"](AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
}),
"[project]/node_modules/.bun/next@16.1.1+df4bf79bce1f90fc/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/node_modules/.bun/next@16.1.1+df4bf79bce1f90fc/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/.bun/next@16.1.1+df4bf79bce1f90fc/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/node_modules/.bun/next@16.1.1+df4bf79bce1f90fc/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/.bun/next@16.1.1+df4bf79bce1f90fc/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__93919477._.js.map