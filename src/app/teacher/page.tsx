import { redirect } from 'next/navigation';

export default function TeacherRedirect() {
  redirect('/teacher/dashboard');
}
