import Vue from 'vue';
import Vuex from 'vuex';
import createLogger from 'vuex/dist/logger';

import * as actions from './actions';
import { initialState as state, mutations } from './mutations';
import * as getters from './getters';

const plugins = [];
if (process.env.NODE_ENV !== 'production') {
    plugins.push(createLogger());
}

Vue.use(Vuex);

export default new Vuex.Store({
    actions,
    getters,
    mutations,
    plugins,
    state,
});
