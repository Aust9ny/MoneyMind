import { useState, useEffect, useRef, SetStateAction } from "react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ThemedSafeAreaView } from "@/components/ThemedSafeAreaView";
import { router } from "expo-router";
import { Image } from "expo-image";
import {
  View,
  TouchableOpacity,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useColorScheme } from "react-native";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedScrollView } from "@/components/ThemedScrollView";
import { ThemedCard } from "@/components/ThemedCard";
import { UserContext } from "@/hooks/conText/UserContext";
import { useContext } from "react";
import { Animated, Easing } from "react-native";
import { TouchableWithoutFeedback } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Entypo from "@expo/vector-icons/Entypo";
import { ThemedScrollViewCenter } from "@/components/ThemedScrollViewCenter";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { resultObject } from "@/hooks/auth/GetUserBank";

const { height } = Dimensions.get("window"); // ใช้สำหรับกำหนด borderRadius

export default function SplitPay() {
  const theme = useColorScheme();
  const isDarkMode = theme === "dark";
  const componentColor = theme === "dark" ? "!bg-[#181818]" : "!bg-[#d8d8d8]";
  const componentIcon = theme === "dark" ? "#f2f2f2" : "#2f2f2f";

  const [selected, setSelected] = useState("budget");
  const [accountCheck, setAccount] = useState(false);
  const [cloudpocketCheck, setCloudPocket] = useState(false);
  const { bank } = useContext(UserContext);
  const [isBudget, setIsBudget] = useState(true);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(true);

  const slideAnim = useRef(new Animated.Value(300)).current;

  const [selectedCard, setSelectedCard] = useState<resultObject | null>(null);
  const [budgetName, setBudgetName] = useState("");
  const limitRef = useRef<number>(0);
  const [budgetLimit, setBudgetLimit] = useState(0);
  const [limit, setLimit] = useState(50);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  // 📌 อัปเดต budgetLimit ตาม limit ทุกครั้งที่เปลี่ยนค่า
  useEffect(() => {
    if (!isEditing && limitRef.current !== limit) {
      if (selectedCard) {
        const newBudgetLimit = (selectedCard.balance * limit) / 100;
        setBudgetLimit(newBudgetLimit);
        limitRef.current = limit;
      }
    }
  }, [limit, selectedCard, isEditing]);

  const handleAmountChange = (text: string) => {
    setIsEditing(true);
    let newAmount = parseFloat(text) || 0;
    newAmount = Math.min(newAmount, selectedCard?.balance || 0);
    const newLimit = selectedCard
      ? (newAmount / selectedCard.balance) * 100
      : 0;
    setBudgetLimit(newAmount);
    setLimit(newLimit);
  };

  const handleSliderChange = (value: SetStateAction<number>) => {
    setIsEditing(false);
    setLimit(value);
  };
  const colors = [
    "#F94144",
    "#F3722C",
    "#F8961E",
    "#F9844A",
    "#F9C74F",
    "#90BE6D",
    "#43AA8B",
    "#4D908E",
    "#577590",
    "#277DA1",
  ];
  const icons = [
    "restaurant",
    "flight",
    "home",
    "directions-car",
    "add-circle-outline",
  ];

  const toggleOverlay = (visible: boolean) => {
    console.log("toggleOverlay:", visible);

    if (visible) {
      setIsOverlayVisible(true); // เปิด Overlay ก่อนเริ่ม Animation
      Animated.timing(slideAnim, {
        toValue: 0, // เลื่อนขึ้นเมื่อเปิด
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height, // เลื่อนลงเมื่อปิด
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => {
        setIsOverlayVisible(false); // ปิด Overlay หลังจาก Animation จบ
        slideAnim.setValue(height); // รีเซ็ตค่าเริ่มต้น
      });
    }
  };

  const screenWidth = Dimensions.get("window").width; // ✅ ความกว้างของหน้าจอ
  const cardWidth = 280; // ✅ ความกว้างของ Card
  const cardMargin = 18; // ✅ Margin ระหว่างการ์ด
  const snapToInterval = cardWidth + cardMargin * 2; // ✅ ระยะ snap ให้เป๊ะ

  const scrollViewRef = useRef<ScrollView>(null);

  const [cardPositions, setCardPositions] = useState<
    { id: number; x: number }[]
  >([]);

  // ✅ เก็บตำแหน่ง X ของแต่ละ Card
  const storeCardPosition = (id: number, x: number) => {
    setCardPositions((prev) => {
      const exists = prev.some((item) => item.id === id);
      if (!exists) return [...prev, { id, x }];
      return prev;
    });
  };

  // ✅ ตรวจจับ Card ที่อยู่กลางหน้าจอ
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const centerScreen = scrollX + screenWidth / 2;

    let closestCard: resultObject | null = null as resultObject | null;
    let minDistance = Number.MAX_VALUE;

    cardPositions.forEach((cardPos) => {
      const distance = Math.abs(cardPos.x - centerScreen);
      if (distance < minDistance) {
        minDistance = distance;
        closestCard = bank?.find((item) => item.id === cardPos.id) || null;
      }
    });

    if (closestCard && (closestCard as resultObject).id !== selectedCard?.id) {
      setSelectedCard(closestCard);
      console.log("🎯 Selected Card:", closestCard);
    }
  };

  // ✅ เลื่อน ScrollView ให้การ์ดแรกอยู่กลางตอนเริ่ม
  useEffect(() => {
    if (bank && bank.length > 0 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: 0, animated: true });
        setSelectedCard(bank[0]); // ✅ ตั้งค่า selectedCard เป็นการ์ดแรก
        console.log("🚀 First Card Selected:", bank[0]);
      }, 500);
    }
  }, [bank]);

  return (
    <ThemedSafeAreaView>
      <ThemedView className="flex-col w-full h-full bg-transparent">
        <ThemedView className=" flex-row !items-center !justify-between w-full px-4">
          <Image
            source={require("@/assets/logos/LOGO.png")}
            style={{
              width: 79,
              height: 70,
              marginTop: "2%",
              marginLeft: "5%",
            }}
          />
          <Ionicons
            onPress={() => router.push("/NotificationPage")}
            name="notifications-outline"
            size={32}
            color={`${componentIcon}`}
            style={{
              alignSelf: "center",
              marginTop: "5%",
              marginRight: "5%",
            }}
          />
        </ThemedView>
        <ThemedView className="flex-row w-full h-10 justify-center bg-transparent p-1 mt-14 ">
          <ThemedView className="flex-row w-72 h-10 rounded-full bg-[#d5d5d5] dark:bg-[#383838] justify-center items-center">
            <Pressable
              onPress={() => setIsBudget(true)}
              className={`w-32 h-full flex items-center justify-center rounded-full ${
                isBudget ? "bg-green-500 w-[160px]" : "bg-transparent w-[120px]"
              }`}
            >
              <ThemedText
                className={`font-bold ${
                  isBudget
                    ? "text-white"
                    : isDarkMode
                    ? "text-white"
                    : "text-black"
                }`}
              >
                BUDGET
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => setIsBudget(false)}
              className={`w-32 h-full flex items-center justify-center rounded-full ${
                !isBudget
                  ? "bg-green-500 w-[160px]"
                  : "bg-transparent w-[120px]"
              }`}
            >
              <ThemedText
                className={`font-bold ${
                  !isBudget
                    ? "text-white"
                    : isDarkMode
                    ? "text-white"
                    : "text-black"
                }`}
              >
                RETIRE
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>

        {bank && bank.length > 0 ? (
          <ThemedView className="flex-col w-full h-fit bg-transparent mt-10">
            <ScrollView
              ref={scrollViewRef} // ✅ ให้ ScrollView ใช้ ref
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={snapToInterval} // ✅ ทำให้ ScrollView หยุดที่แต่ละการ์ด
              decelerationRate="fast"
              onScroll={handleScroll}
              scrollEventThrottle={16} // ✅ ตรวจจับ scroll อย่างละเอียด
              className="w-full"
            >
              <ThemedView className="w-full px-16">
                <ThemedView className="mt-0.5 mb-1 flex-row space-x-1 gap-5">
                  {bank?.map((account: resultObject, index: number) => (
                    <Pressable
                      key={account.id}
                      onLayout={(event) => {
                        const x =
                          event.nativeEvent.layout.x +
                          10 +
                          event.nativeEvent.layout.width / 2;
                        storeCardPosition(account.id, x);
                      }}
                    >
                      <ThemedView>
                        <ThemedCard
                          key={account.id}
                          CardID={account.id}
                          name={account.account_name}
                          color={account.color_code}
                          balance={account.balance.toString()}
                          mode="large"
                          imageIndex={Number(account.icon_id)}
                          className={`!items-center !justify-center bg-[#fefefe] rounded-lg 
                                      ${
                                        selectedCard?.id === account.id
                                          ? "border-4 border-[#03A696]"
                                          : "border-0"
                                      }
                                    `}
                        />
                      </ThemedView>
                    </Pressable>
                  ))}
                </ThemedView>
              </ThemedView>
            </ScrollView>
            <ThemedView className=" my-5 w-[80%] mt-10">
              <ThemedText className="text-xl font-bold text-start w-full">
                Monthly Budgets
              </ThemedText>
            </ThemedView>
            <ThemedView className=" w-[80%] h-fit mb-12">
              <Pressable
                className={`justify-center items-center rounded-3xl w-[320px] h-[280px] ${componentColor} ml-2`}
                onPress={() => toggleOverlay(true)}
              >
                <AntDesign
                  name="filetext1"
                  size={70}
                  color={`${componentIcon}`}
                  className="m-3"
                />
                <ThemedView className="bg-transparent w-56 h-18">
                  <ThemedText className="text-[#484848] dark:text-white mx-5 text-center font-bold">
                    Let’s get started with your first budget plan!
                  </ThemedText>
                </ThemedView>

                <ThemedView className="w-12 h-12 mt-5 bg-transparent border-2 border-[#484848] dark:border-white rounded-full flex items-center justify-center">
                  <Ionicons name="add" size={24} color={componentIcon} />
                </ThemedView>
              </Pressable>
            </ThemedView>
          </ThemedView>
        ) : (
          <ThemedView className="flex-col  justify-center items-center bg-transparent p-1 mt-10 mb-4">
            <Pressable
              className={`${componentColor} flex-col w-[280px] h-[180px] rounded-2xl justify-center items-center p-4`}
              onPress={() => router.push("/AddAccount")}
            >
              <ThemedView className="w-12 h-12 bg-[#949494] dark:bg-[#383838] rounded-full flex items-center justify-center">
                <Ionicons name="add" size={24} color="white" />
              </ThemedView>
              <ThemedText className="text-[#484848] dark:text-white text-center text-[18px] font-bold mt-5">
                Add Account
              </ThemedText>
            </Pressable>
            <ThemedView className="flex-row items-center pt-[10%]">
              <ThemedView
                className={`justify-center items-center rounded-[10%]  w-[340px] h-[220px] ${componentColor} ml-2`}
              >
                <AntDesign
                  name="filetext1"
                  size={70}
                  color={`${componentIcon}`}
                  className="m-3"
                />
                <ThemedText className="text-[#484848] dark:text-white mx-5 text-center font-bold">
                  Please create an account to proceed with your transaction.
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}
      </ThemedView>
      {isOverlayVisible && (
        <TouchableWithoutFeedback onPress={() => toggleOverlay(false)}>
          <View className="absolute inset-0 bg-[#00000055] flex items-center justify-end pb-1">
            <Animated.View
              style={{
                transform: [{ translateY: slideAnim }],
                width: "100%",
                height: 480,
                borderTopLeftRadius: 40,
                borderTopRightRadius: 40,
              }}
              className="p-6 bg-[#f2f2f2] dark:bg-[#222222] shadow-lg"
            >
              {/* ห่อเนื้อหาทั้งหมดเพื่อป้องกันการกดแล้ว Overlay ปิด */}
              <View
                className="h-full w-full"
                onStartShouldSetResponder={() => true}
              >
                <View className="flex items-center">
                  {/* รูปโปรไฟล์ Budget */}
                  <View
                    className="w-28 h-28 rounded-lg flex items-center justify-center mb-8"
                    style={{
                      backgroundColor:
                        selectedColor || (isDarkMode ? "#2D3748" : "#D3D3D3"),
                    }} // สีพื้นหลังขึ้นกับธีม
                  >
                    {selectedIcon ? (
                      <MaterialIcons
                        name={selectedIcon as any}
                        size={42}
                        color="white"
                      />
                    ) : (
                      <Ionicons
                        name="person-outline"
                        size={32}
                        color={isDarkMode ? "white" : "gray"}
                      />
                    )}
                  </View>

                  {/* เลือกสี */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="w-full"
                  >
                    <View className="flex-row gap-x-4 px-4">
                      {colors.map((color, index) => (
                        <Pressable
                          key={index}
                          onPress={() => setSelectedColor(color)}
                          className={`w-8 h-8 rounded-full border-2 ${
                            selectedColor === color
                              ? isDarkMode
                                ? "border-white"
                                : "border-black"
                              : "border-gray-500 dark:border-gray-700"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </View>
                  </ScrollView>

                  {/* เลือกไอคอน */}
                  <View className="flex-row space-x-3 mt-4">
                    {icons.map((icon, index) => (
                      <Pressable
                        key={index}
                        onPress={() => setSelectedIcon(icon)}
                        className="p-2"
                      >
                        <MaterialIcons
                          name={icon as any}
                          size={32}
                          color={
                            selectedIcon === icon
                              ? isDarkMode
                                ? "white"
                                : "black"
                              : "gray"
                          }
                        />
                      </Pressable>
                    ))}
                  </View>

                  {/* Budget Name */}
                  <View className="w-full mt-4">
                    <ThemedText className="font-bold text-lg text-gray-900 dark:text-white">
                      Budget Name
                    </ThemedText>
                    <ThemedView className="w-full flex-row bg-transparent">
                      <TextInput
                        placeholder="Enter Budget Name"
                        keyboardType="numeric"
                        style={{
                          backgroundColor:
                            theme === "dark" ? "#121212" : "#D9D9D9",
                          color: theme === "dark" ? "#FFF" : "#2F2F2F",
                          borderRadius: 12,
                          padding: 10,
                        }}
                        onChangeText={setBudgetName}
                        placeholderTextColor={
                          theme === "dark" ? "#888" : "#555"
                        } // ✅ รองรับ Dark Mode
                        className="w-full"
                      />
                    </ThemedView>
                  </View>

                  {/* Budget Limit */}
                  <View className="w-full mt-4 p-4 bg-white dark:bg-[#222] rounded-lg shadow-lg">
                    {/* Label "Limits" พร้อมช่องกรอกจำนวนเงิน */}
                    <View className="flex-row items-center justify-between">
                      <Text className="font-bold text-lg text-gray-900 dark:text-white">
                        Limits
                      </Text>
                      <View className="w-32 h-10 p-2 bg-gray-200 dark:bg-gray-800 rounded-lg">
                        <TextInput
                          value={
                            isEditing
                              ? budgetLimit.toString()
                              : budgetLimit.toFixed(0)
                          }
                          onChangeText={handleAmountChange}
                          keyboardType="numeric"
                          placeholder="0.00"
                          placeholderTextColor="#AAA"
                          className="text-right text-gray-900 dark:text-white text-lg"
                          style={{ height: 38 }}
                        />
                      </View>
                    </View>
                    <Slider
                      value={limit}
                      onValueChange={handleSliderChange}
                      minimumValue={0}
                      maximumValue={100}
                      step={5}
                      className="w-full my-2"
                    />
                    <Text className="text-gray-600 dark:text-gray-300">
                      {limit.toFixed(0)}% ({budgetLimit.toFixed(2)} THB)
                    </Text>

                    {/* ปุ่ม Save */}
                    <Pressable
                      onPress={() => toggleOverlay(false)}
                      className="p-3 bg-gray-400 dark:bg-gray-700 rounded-lg mt-4 w-full"
                    >
                      <Text className="text-center font-bold text-white">
                        Save
                      </Text>
                    </Pressable>
                  </View>

                  {/* ปุ่ม Save */}
                  <Pressable
                    onPress={() => toggleOverlay(false)}
                    className="p-3 bg-gray-400 dark:bg-gray-700 rounded-lg mt-4 w-full"
                  >
                    <ThemedText className="text-center font-bold text-white">
                      Save
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      )}
    </ThemedSafeAreaView>
  );
}
