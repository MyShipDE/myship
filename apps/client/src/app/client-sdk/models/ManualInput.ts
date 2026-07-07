export class ManualInput {
  id: number;
  typeId: number;
  name: string;
  IsSelected = false;
}

export class ManualInputType {
  id: number;
  name: string;
  values: ManualInput[];
}
