import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  HostBinding,
} from '@angular/core';

@Component({
  selector: 'app-text-field',
  templateUrl: './text-field.component.html',
  styleUrls: ['./text-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextFieldComponent {
  @Input() public name?: string;
  @Input() public label?: string;
  @Input() public required = false;
  @Input() public type = 'text';
  @Input() public autocomplete = true;
  @Input() public formControlName?: string;
  @Input() public pristine = false;
  @Input() public placeholder?: string;
  @Input() public multiline = false;
  @Input() public rows = 1;
  @Input() public value: any = '';
  @Input('readonly') public set readonlyProp(value: boolean) {
    this.hostReadonlyAttribute = value;
    this.readonly = value;
  }
  public readonly = false;

  @Input('errors') public set errorsProp(value: any) {
    if (Array.isArray(value)) {
      this.errors = value.filter(element => typeof element === 'string');
    } else if (typeof value === 'string') {
      this.errors = [ value ];
    } else {
      this.errors = [];
    }
  }
  public errors: string[] = [];

  @Output() public changeValue = new EventEmitter<any>();

  @HostBinding('attr.readonly')
  public hostReadonlyAttribute: boolean;
}