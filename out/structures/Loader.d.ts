import ValClient from '../ValClient';
export default abstract class Loader {
    client: ValClient;
    constructor(client: ValClient);
    abstract load(): void;
}
