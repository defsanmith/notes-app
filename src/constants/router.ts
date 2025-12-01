export class Routes {
  static HOME = "/";
  static SIGN_IN = "/auth/signin";
  static SIGN_UP = "/auth/signup";
  static NOTE = "/note";

  static getNoteRoute(noteId: string) {
    return `${this.NOTE}/${noteId}`;
  }
}
