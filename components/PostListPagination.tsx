// "use client";

// import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import { PaginationInfo } from "@/lib/schemas";
// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationPrevious,
//   PaginationNext,
//   PaginationEllipsis,
// } from "@/components/ui/pagination";

// type PostListPaginationProps = Pick<PaginationInfo, 'currentPage' | 'totalPages' | 'hasNextPage' | 'hasPrevPage'>;

// export function PostListPagination({
//   currentPage,
//   totalPages,
//   hasNextPage,
//   hasPrevPage,
// }: PostListPaginationProps) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   const handlePageChange = (page: number) => {
//     if (page >= 1 && page <= totalPages) {
//       const params = new URLSearchParams(searchParams.toString());
//       if (page === 1) {
//         params.delete("page");
//       } else {
//         params.set("page", page.toString());
//       }

//       const queryString = params.toString();
//       const url = queryString ? `${pathname}?${queryString}` : pathname;
//       router.push(url);
//     }
//   };

//   const pageItems: (number | "ellipsis")[] = (() => {
//     if (totalPages <= 7) {
//       return Array.from({ length: totalPages }, (_, i) => i + 1);
//     }

//     if (currentPage <= 4) {
//       return [1, 2, 3, 4, 5, "ellipsis", totalPages];
//     }

//     if (currentPage >= totalPages - 3) {
//       return [1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
//     }

//     return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
//   })();

//   return (
//     <div className="w-full rounded-3xl px-4 py-3 shadow-sm shadow-slate-200/60 dark:shadow-none">
//       <div className="mb-3 text-center text-sm font-medium text-slate-700 dark:text-slate-500 md:hidden">
//         Page {currentPage} of {totalPages}
//       </div>

//       <Pagination>
//         <PaginationContent>
//           <PaginationItem>
//             <PaginationPrevious
//               href="#"
//               onClick={(e) => {
//                 e.preventDefault();
//                 if (hasPrevPage) handlePageChange(currentPage - 1);
//               }}
//               className={hasPrevPage ? undefined : "opacity-50 cursor-not-allowed"}
//             />
//           </PaginationItem>

//           <PaginationItem className="hidden md:block">
//             <div className="sr-only">Page navigation</div>
//           </PaginationItem>

//           <PaginationItem className="md:hidden">
//             <PaginationLink href="#" isActive>
//               {currentPage}
//             </PaginationLink>
//           </PaginationItem>

//           {pageItems.map((item, index) =>
//             item === "ellipsis" ? (
//               <PaginationItem key={`ellipsis-${index}`} className="hidden md:block">
//                 <PaginationEllipsis />
//               </PaginationItem>
//             ) : (
//               <PaginationItem key={item} className="hidden md:block">
//                 <PaginationLink
//                   href="#"
//                   isActive={item === currentPage}
//                   onClick={(e) => {
//                     e.preventDefault();
//                     handlePageChange(item);
//                   }}
//                 >
//                   {item}
//                 </PaginationLink>
//               </PaginationItem>
//             )
//           )}

//           <PaginationItem>
//             <PaginationNext
//               href="#"
//               onClick={(e) => {
//                 e.preventDefault();
//                 if (hasNextPage) handlePageChange(currentPage + 1);
//               }}
//               className={hasNextPage ? undefined : "opacity-50 cursor-not-allowed"}
//             />
//           </PaginationItem>
//         </PaginationContent>
//       </Pagination>
//     </div>
//   );
// }
