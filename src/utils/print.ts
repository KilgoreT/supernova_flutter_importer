export function print(input: string): void {
    const lines = input.split('\n');
    for (const line of lines) {
        console.log(line);
    }
}