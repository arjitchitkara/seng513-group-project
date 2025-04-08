export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'USER' | 'MODERATOR' | 'ADMIN';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          role?: 'USER' | 'MODERATOR' | 'ADMIN';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'USER' | 'MODERATOR' | 'ADMIN';
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          bio: string | null;
          avatar: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          bio?: string | null;
          avatar?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          bio?: string | null;
          avatar?: string | null;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          subject: string;
          description: string;
          document_count: number;
          rating: number;
          user_count: number;
          image_src: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          subject: string;
          description: string;
          document_count?: number;
          rating?: number;
          user_count?: number;
          image_src?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          subject?: string;
          description?: string;
          document_count?: number;
          rating?: number;
          user_count?: number;
          image_src?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          title: string;
          type: 'NOTES' | 'LAB_REPORT' | 'ESSAY' | 'STUDY_GUIDE' | 'PRACTICE_PROBLEMS' | 'OTHER';
          pages: number;
          status: 'PENDING' | 'APPROVED' | 'REJECTED';
          file_path: string;
          course_id: string;
          user_id: string;
          uploader_id: string;
          created_at: string;
          updated_at: string;
          downloads: number;
          rating: number | null;
        };
        Insert: {
          id?: string;
          title: string;
          type: 'NOTES' | 'LAB_REPORT' | 'ESSAY' | 'STUDY_GUIDE' | 'PRACTICE_PROBLEMS' | 'OTHER';
          pages: number;
          status?: 'PENDING' | 'APPROVED' | 'REJECTED';
          file_path: string;
          course_id: string;
          user_id: string;
          uploader_id: string;
          created_at?: string;
          updated_at?: string;
          downloads?: number;
          rating?: number | null;
        };
        Update: {
          id?: string;
          title?: string;
          type?: 'NOTES' | 'LAB_REPORT' | 'ESSAY' | 'STUDY_GUIDE' | 'PRACTICE_PROBLEMS' | 'OTHER';
          pages?: number;
          status?: 'PENDING' | 'APPROVED' | 'REJECTED';
          file_path?: string;
          course_id?: string;
          user_id?: string;
          uploader_id?: string;
          created_at?: string;
          updated_at?: string;
          downloads?: number;
          rating?: number | null;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          document_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          document_id?: string;
          created_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      role_type: 'USER' | 'MODERATOR' | 'ADMIN';
      document_type: 'NOTES' | 'LAB_REPORT' | 'ESSAY' | 'STUDY_GUIDE' | 'PRACTICE_PROBLEMS' | 'OTHER';
      approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
    };
  };
}; 