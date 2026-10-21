/** Admin if the backend says so, or (for demo/testing) the email starts with "admin". */
export function isAdmin(email?: string, role?: string) {
  return role === 'admin' || (email ?? '').toLowerCase().startsWith('admin');
}
