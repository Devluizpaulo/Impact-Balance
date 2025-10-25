
import { EventEmitter } from 'events';

// Since we are in a single-threaded environment, a simple event emitter is sufficient.
export const errorEmitter = new EventEmitter();
