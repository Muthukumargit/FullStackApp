// export function getCsrfTokenFromCookie(): string | null {
//     const name = "XSRF-TOKEN=";
//     const decoded = decodeURIComponent(document.cookie);
//     const parts = decoded.split(';');
//     for (let part of parts) {
//         if (part.trim().startsWith(name)) {
//             return part.trim().substring(name.length);
//         }
//     }
//     return null;
// }