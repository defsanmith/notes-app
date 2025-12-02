export class Routes {
  static HOME = "/";
  static SIGN_IN = "/auth/signin";
  static SIGN_UP = "/auth/signup";
  static NOTE = "/note";
  static ADMIN = "/admin";
  static ADMIN_NOTE = "/admin/note";

  static getNoteRoute(noteId: string) {
    return `${this.NOTE}/${noteId}`;
  }

  static getAdminNoteRoute(noteId: string) {
    return `${this.ADMIN_NOTE}/${noteId}`;
  }
}
