import { useState, useEffect } from "react";
import { DocumentUploader } from "@/components/DocumentUploader";
import { GlassMorphism } from "@/components/ui/GlassMorphism";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
}

const UploadDocumentPage = () => {
  const navigate = useNavigate();
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const coursesData = await response.json();
        setCourses(coursesData);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
        // Fallback to mock data if API fails
        const mockCourses = [
          { id: "1", title: "Introduction to Computer Science" },
          { id: "2", title: "Calculus I" },
          { id: "3", title: "Economics 101" },
        ];
        setCourses(mockCourses);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  const handleUploadComplete = () => {
    navigate("/my-documents");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Upload Document</h1>
        <button 
          onClick={() => navigate("/dashboard")}
          className="flex items-center px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
      
      <GlassMorphism className="p-6 mb-6" intensity="light">
        <div className="mb-6">
          <Label htmlFor="course">Select Course</Label>
          <Select 
            value={selectedCourseId} 
            onValueChange={setSelectedCourseId}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedCourseId ? (
          <DocumentUploader 
            courseId={selectedCourseId} 
            onUploadComplete={handleUploadComplete} 
          />
        ) : (
          <p className="text-center py-6 text-muted-foreground">
            Please select a course to upload a document.
          </p>
        )}
      </GlassMorphism>
    </div>
  );
};

export default UploadDocumentPage;
