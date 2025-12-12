// import { prisma } from '@/lib/prisma';
// import { jsonResponse } from '@/lib/api-response';

// export async function GET() {
//   try {
//     const users = await prisma.user.findMany({
//       take: 5,
//     });

//     return jsonResponse({
//       success: true,
//       count: users.length,
//       users
//     });
//   } catch (error) {
//     return jsonResponse({
//       success: false,
//       error: String(error)
//     }, 500);
//   }
// }
