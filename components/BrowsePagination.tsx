// "use client";

// import { useRouter, useSearchParams } from "next/navigation";
// import { PaginationInfo } from "@/lib/schemas";
// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from "@/components/ui/pagination";

// type BrowsePaginationProps = Pick<PaginationInfo, 'currentPage' | 'totalPages' | 'hasNextPage' | 'hasPrevPage'>;

// export function BrowsePagination({
//   currentPage,
//   totalPages,
//   hasNextPage,
//   hasPrevPage,
// }: BrowsePaginationProps) {
//   const router = useRouter();
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
//       const url = queryString ? `/browse?${queryString}` : "browse";
//       router.push(url);
//     }
//   };

//   if (totalPages <= 1) return null;

//   return (
//     <div className="flex justify-center py-8">
//       <Pagination>
//         <PaginationContent>
//           {hasPrevPage && (
//             <PaginationItem>
//               <PaginationPrevious
//                 href="#"
//                 onClick={(e) => {
//                   e.preventDefault();
//                   handlePageChange(currentPage - 1);
//                 }}
//               />
//             </PaginationItem>
//           )}

//           {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
//             <PaginationItem key={pageNum}>
//               <PaginationLink
//                 href="#"
//                 isActive={pageNum === currentPage}
//                 onClick={(e) => {
//                   e.preventDefault();
//                   handlePageChange(pageNum);
//                 }}
//               >
//                 {pageNum}
//               </PaginationLink>
//             </PaginationItem>
//           ))}

//           {hasNextPage && (
//             <PaginationItem>
//               <PaginationNext
//                 href="#"
//                 onClick={(e) => {
//                   e.preventDefault();
//                   handlePageChange(currentPage + 1);
//                 }}
//               />
//             </PaginationItem>
//           )}
//         </PaginationContent>
//       </Pagination>
//     </div>
//   );
// };
