// src/context/UserContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// يمكنك إضافة أي دالة API خاصة بجلب بيانات المستخدم هنا
// أو تمريرها كـ prop في الـ Provider إذا كانت متوفرة بالفعل
const PLACEHOLDER_IMAGE = "https://t4.ftcdn.net/jpg/00/97/00/09/360_F_97000908_wwH2goIihwrMoeV9QF3BW6HtpsVFaNVM.jpg";

// تعريف السياق (Context)
const UserContext = createContext();

// الخطاف المخصص للوصول إلى السياق بسهولة
export const useUser = () => useContext(UserContext);

// مزود السياق (Context Provider)
export const UserProvider = ({ children }) => {
    // الحالة الرئيسية التي ستخزن بيانات المستخدم (الصورة كبداية)
    const [userProfileData, setUserProfileData] = useState({
        profileImage: PLACEHOLDER_IMAGE, // القيمة الافتراضية
    });

    // دالة لتحديث صورة البروفايل من أي مكان في التطبيق
    const updateProfileImage = useCallback((newImageUrl) => {
        setUserProfileData(prev => ({
            ...prev,
            profileImage: newImageUrl || PLACEHOLDER_IMAGE,
        }));
    }, []);

    // دالة لتحديث أي بيانات أخرى (إذا أردتِ إضافة الاسم، النقاط، إلخ. لاحقاً)
    const updateUserProfile = useCallback((newUserData) => {
        setUserProfileData(prev => ({
            ...prev,
            ...newUserData,
            // التأكد من تحديث الصورة عند وجودها
            profileImage: newUserData.profileImage || prev.profileImage, 
        }));
    }, []);

    const value = {
        userProfileData,
        updateProfileImage,
        updateUserProfile,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};