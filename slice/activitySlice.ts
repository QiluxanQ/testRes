import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";

 interface NewPost {
    title: string;
    id: number;
    userId?: number;
}

const url = 'https://jsonplaceholder.typicode.com/users'
const generateRequestId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
export const fetchActivity = createAsyncThunk(
    'activity/fetchActivity',
    async () => {
        const [activityRes,postRes] = await Promise.all([
            fetch(url),
            fetch('https://jsonplaceholder.typicode.com/posts',{
                headers:{
                    'X-Request-ID': generateRequestId(),
                }
            }),
        ]);
        const [user,post] =await Promise.all([
            activityRes.json(),
            postRes.json(),

        ])
        return {user,post}
    }

)

export const deleteUser = createAsyncThunk(
    'activity/deleteUser',
    async (userId) => {
        await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`,{
            method:'DELETE'
        })
        return userId
    }
)

export const addPost = createAsyncThunk (
    'activity/addPost',
    async (newPost: NewPost) => {
        const res = await fetch('https://jsonplaceholder.typicode.com/posts',{
            method:'POST',
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(newPost)
        })
        const data = await res.json()
        return data
    }
)

const activitySlice = createSlice({
    name: 'recentActivities',
    initialState:{
        status:'idle',
        userTotal:[],
        postTotal:[],
        postTotals:[],
        error:null
    },
    reducers:{},
    extraReducers:(builder) => {
        builder
            .addCase(fetchActivity.pending,(state) => {
                state.status = 'loading'
            })
            .addCase(fetchActivity.fulfilled,(state,action) => {
                state.status = 'succeeded'
                state.postTotals.push(action.payload)
                state.userTotal = action.payload.user
                state.postTotal = action.payload.post
            })
            .addCase(fetchActivity.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(deleteUser.fulfilled,(state,action) => {
                state.userTotal = state.userTotal.filter(user => user.id !== action.payload)
            })
    }
})

export default activitySlice.reducer