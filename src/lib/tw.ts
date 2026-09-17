export function tw(strings: TemplateStringsArray, ...values: unknown[]): string {
  return strings.reduce(
    (result, part, index) =>
      result + part + (index < values.length ? String(values[index]) : ''),
    ''
  );
}
