import {configureStore} from "@reduxjs/toolkit";
import recentActivitiesReducer from '../slice/activitySlice'
import orderReducer from '../slice/ordersSlice'
import menuReduser from '../slice/menuSlice'
import reservationReducer from '../slice/reservationSlice'

export const store = configureStore({
    reducer: {
        recentActivities:recentActivitiesReducer,
        orders:orderReducer,
        menu:menuReduser,
        reservations:reservationReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;