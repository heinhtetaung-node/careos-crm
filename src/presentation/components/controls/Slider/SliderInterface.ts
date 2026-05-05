export default abstract class ISliderInterface {
  abstract countCharacters(char: string, string: string): number;

  public abstract handleKeyDown(
    event: KeyboardEvent & Partial<React.ChangeEvent<HTMLInputElement>>,
    inputValue: string
  ): void;

  public abstract formatToString(
    text: string,
    max: number,
    eventType?: string
  ): string;

  public abstract formatStringToArray(text: string): number[];
}
