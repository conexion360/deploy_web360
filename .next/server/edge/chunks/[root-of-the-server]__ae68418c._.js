(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["chunks/[root-of-the-server]__ae68418c._.js", {

"[externals]/node:buffer [external] (node:buffer, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}}),
"[project]/ [middleware-edge] (unsupported edge import stream, ecmascript)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
__turbopack_context__.n(__import_unsupported(`stream`));
}}),
"[externals]/node:util [external] (node:util, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:util", () => require("node:util"));

module.exports = mod;
}}),
"[project]/ [middleware-edge] (unsupported edge import crypto, ecmascript)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
__turbopack_context__.n(__import_unsupported(`crypto`));
}}),
"[project]/src/lib/auth.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

// src/lib/auth.ts
__turbopack_context__.s({
    "verifyAuth": ()=>verifyAuth
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jsonwebtoken/index.js [middleware-edge] (ecmascript)");
;
async function verifyAuth(request) {
    try {
        // Obtener token de autorización
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                success: false,
                error: 'Token no proporcionado',
                status: 401,
                user: null
            };
        }
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'secret_key';
        // Verificar el token
        const decoded = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"].verify(token, secret);
        // Verificar que el token decodificado contiene la info correcta
        if (!decoded || typeof decoded !== 'object' || !decoded.id) {
            return {
                success: false,
                error: 'Token inválido',
                status: 401,
                user: null
            };
        }
        return {
            success: true,
            user: decoded,
            error: null,
            status: 200
        };
    } catch (error) {
        console.error('Error en verificación de autenticación:', error);
        return {
            success: false,
            error: 'Error de autenticación',
            status: 401,
            user: null
        };
    }
}
}),
"[project]/src/middleware.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

// src/middleware.ts
__turbopack_context__.s({
    "config": ()=>config,
    "middleware": ()=>middleware
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/spec-extension/response.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [middleware-edge] (ecmascript)");
;
;
async function middleware(request) {
    // Rutas que no requieren autenticación
    const publicPaths = [
        '/api/auth',
        '/api/db-check'
    ];
    // Si la ruta es pública, permitir acceso
    const path = request.nextUrl.pathname;
    if (!path.startsWith('/api/') || publicPaths.some((publicPath)=>path.startsWith(publicPath))) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // Verificar token JWT para rutas protegidas
    const auth = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["verifyAuth"])(request);
    if (!auth.success) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: auth.error
        }, {
            status: auth.status
        });
    }
    // Si la autenticación es exitosa, permitir acceso
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: '/api/:path*'
};
}),
}]);

//# sourceMappingURL=%5Broot-of-the-server%5D__ae68418c._.js.map