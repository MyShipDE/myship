export class TemplateVDR {

  static templates: TemplateVDR[] = [];
  id: number;
  active: boolean;
  central: boolean;

  constructor(public name?: string, public loggingInterval?: number, public idleTime?: number, public radiusOfMovement?: number, public reminderInterval?: number, public allowedCourseChange?: number) {
  }

}
