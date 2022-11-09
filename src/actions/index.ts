import { Action } from "../action_types";
import { actions as subActions } from "./actions";
import { operators } from "./operators";
import { motions } from "./motions";

export const actions: Action[] = subActions.concat(operators, motions);
