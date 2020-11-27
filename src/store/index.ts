import { createStore } from 'vuex'

interface State {
  userName: String
}

export default createStore({
  state(): State {
    return {
      userName: 'Owen Lin'
    }
  }
})