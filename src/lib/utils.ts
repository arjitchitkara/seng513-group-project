import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function searchDB(output: string, inputs: string[], searchString: string, searchResults: (results: string[][])=>void) {
  {/* "output" is the table whose rows are returned.
      "inputs" are the columns that will be searched. 
      If a column is not from table "output", it will only searched be searched if "output" contains a foreign key referring to the table containing that column 
      "searchString" is the string that will be searched for (Check if string part of that column).
      "searchResults" is the state used to return output results back to parent component.
      Numerical strings and table columns containing numbers not yet supported.
  */}
  return
}
