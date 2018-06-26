import Vue from 'vue';
import Vuex from 'vuex';

import * as actions from './actions';
import { initialState as state, mutations } from './mutations';

Vue.use(Vuex);

export default new Vuex.Store({
    actions,
    state,
    mutations,
});
