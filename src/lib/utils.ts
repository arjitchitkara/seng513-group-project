import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { prisma } from '@/lib/prisma';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function searchDB(output: string, searchString: string, setSearchResults: React.Dispatch<React.SetStateAction<any[]>>) {
  {/* "output" is the table whose rows are returned.
      "searchString" is the string that will be searched for (Check if string part of that column).
      "searchResults" is the state used to return output results back to parent component.
      Numerical strings and table columns containing numbers not yet supported.
  */}
  {/*
  try {
    { output == "Course" &&
      setSearchResults(
        await prisma.course.findMany({
          where: {
            OR: [
              { title: { contains: searchString } },
              { subject: { contains: searchString } },
              { description: { contains: searchString}}
            ]
          },
          select: {
            id: true,
            title: true,
            subject: true,
            description: true,
            documentCount: true,
            rating: true,
            userCount: true,
            imageSrc: true
          },
          distinct: ['id']
        })
      )
    }
    { output == "Document" &&
      setSearchResults(
        await prisma.document.findMany({
          where: {
            OR: [
              { title: { contains: searchString } }
            ]
          },
          select: {
            id: true,
            title: true,
            pages: true,
            status: true,
            filePath: true,
            updatedAt: true,
            downloads: true,
            rating: true,
            course: {
              select: { title: true }
            }
          },
          distinct: ['id']
        })
      )
    }
  } catch (error) {
    return
  }
  */}
  return
}
