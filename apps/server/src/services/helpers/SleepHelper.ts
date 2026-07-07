export class SleepHelper {

    static timeout() {
        return new Promise<void>(resolve => {
            setTimeout(() => {
                resolve();
            }, 10000)
        });
    }

}
