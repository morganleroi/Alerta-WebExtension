import * as React from "react"
import * as ReactDOM from "react-dom"
import { getState } from '../chromium/state'

import UserPreferences from "./UserPreferences"

var mountNode = document.getElementById("userpreferences");
ReactDOM.render(<UserPreferences state={getState} state2={getState()} />, mountNode);