import Loader from '../structures/Loader';
import ValClient from '../ValClient';
export default class CommandsLoader extends Loader {
    constructor(client: ValClient);
    load: () => void;
}
