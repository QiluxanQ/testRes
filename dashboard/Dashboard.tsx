import React, {useEffect, useState} from 'react';
import RevenueChart from "./blocks/RevenueChart";
import { useDispatch, useSelector } from 'react-redux';
import RevenueCard from "./blocks/RevenueCard";
import Activ from "./blocks/Activ";
import Action from "./blocks/Action";
import StatysRestoran from "./blocks/StatysRestoran";
import TopBluds from "./blocks/TopBluds";

import {addPost, deleteUser, fetchActivity} from "../../../slice/activitySlice";
import {AppDispatch, RootState} from "../../../store/store";
import {useTheme} from "../../../context/ThemeContext";
export function Dashboard() {
    const { theme, toggleTheme } = useTheme();
    const {postTotal,userTotal } = useSelector(
        (state: RootState) => state.recentActivities
    );

    const dispatch = useDispatch<AppDispatch>();
    const handleDeleteUser = (userId) => {
        dispatch(deleteUser(userId))
    }

    useEffect(() => {
        dispatch(fetchActivity());
    }, [dispatch]);
  return (
    <div className={`space-y-6  theme-${theme}`}>
        {/* Основные метрики */}
      <RevenueCard />
      {/* Графики и аналитика */}
      <RevenueChart />
      {/* Недавняя активность и быстрые действия */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[200px]">
            <div className="lg:col-span-2">
                <Activ handleDeleteUser={handleDeleteUser} recentActivities={userTotal} />
            </div>
            <div className="lg:col-span-1">
                <Action />
            </div>
        </div>
      {/* Текущие показатели работы */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Статус ресторана */}
        <StatysRestoran />
        {/* Топ блюда дня */}
       <TopBluds   />
      </div>
    </div>
  );
}