import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";


export const fetchOrder = createAsyncThunk(
    'order/fetchOrder',
    async () => {
        const [typeRes, orderDataRes] = await Promise.all([
            fetch(''),
            fetch(''),
        ])
        const [type, orderData] = await Promise.all([
            typeRes.json(),
            orderDataRes.json()
        ])
        return {type, orderData}
    }
)


const ordersSlice = createSlice({
    name: 'orders',
    initialState: {
        status: 'idle',
        typeTotal: [],
        orderDataTotal: [],
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrder.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(fetchOrder.fulfilled,(state,action) => {
                state.status = 'succeeded'
                state.typeTotal = action.payload.type
                state.orderDataTotal = action.payload.orderData
            })
    }
})


export default ordersSlice.reducer