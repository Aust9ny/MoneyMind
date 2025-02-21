import { ThemedCard } from "@/components/ThemedCard";
import { ThemedSafeAreaView } from "@/components/ThemedSafeAreaView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedScrollView } from "@/components/ThemedScrollView";
import { ThemedView } from "@/components/ThemedView";
import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "@/hooks/conText/UserContext";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  TextInput,
  useColorScheme,
} from "react-native";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput";
import { router } from "expo-router";
import DropdownComponent from "@/components/Dropdown";
import { ThemedScrollViewCenter } from "@/components/ThemedScrollViewCenter";
import Icon from "react-native-vector-icons/Feather";
import DateTimePickerInput from "@/components/Date_and_Time";
import CustomDateTimePicker from "@/components/Date_and_Time";
import { resultObject } from "@/hooks/auth/GetUserBank";

type ThemedInputProps = {
  className?: string;
  error?: string;
  title?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  onChangeText?: (text: string) => void;
  [key: string]: any;
};



export default function Index() {
  const { bank } = useContext(UserContext);
  const theme = useColorScheme();
  const [isIncome, setIsIncome] = useState(true);
  // หมวดหมู่ของ Income และ Expense พร้อมโลโก้
  const [selectedIncomeCategory, setSelectedIncomeCategory] = useState("");
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState("");

  const incomeCategories = [
    { name: "Salary", icon: "dollar-sign" },
    { name: "Bonus", icon: "gift" },
    { name: "Investment", icon: "trending-up" },
    { name: "Freelance", icon: "briefcase" },
    { name: "Rental Income", icon: "home" },
    { name: "Dividends", icon: "pie-chart" },
    { name: "Royalties", icon: "music" },
    { name: "Interest", icon: "percent" },
    { name: "Selling", icon: "shopping-cart" },
    { name: "Consulting", icon: "users" },
    { name: "Stock Trading", icon: "bar-chart" },
    { name: "Other", icon: "more-horizontal" },
    { name: "Passive Income", icon: "trending-up" },
    { name: "Side Hustle", icon: "briefcase" },
    { name: "Part-time Job", icon: "clock" },
    { name: "add", icon: "plus" },
  ];

  const expenseCategories = [
    { name: "Food", icon: "coffee" },
    { name: "Transport", icon: "car" },
    { name: "Rent", icon: "home" },
    { name: "Shopping", icon: "shopping-bag" },
    { name: "Entertainment", icon: "film" },
    { name: "Healthcare", icon: "heart" },
    { name: "Education", icon: "book" },
    { name: "Bills", icon: "file-text" },
    { name: "Insurance", icon: "shield" },
    { name: "Subscriptions", icon: "credit-card" },
    { name: "Travel", icon: "airplane" },
    { name: "Fitness", icon: "dumbbell" },
    { name: "Groceries", icon: "shopping-cart" },
    { name: "Other", icon: "more-horizontal" },
    { name: "add", icon: "plus" },
  ];

  const [categories, setCategories] = useState(incomeCategories);

  useEffect(() => {
    setCategories(isIncome ? incomeCategories : expenseCategories);
  }, [isIncome]);

  const [budgetPlan, setBudgetPlan] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");


  // ฟังก์ชันเพิ่มหมวดหมู่ โดยให้ปุ่ม `+` คงอยู่ท้ายสุดเสมอ
  const addNewCategory = () => {
    console.log("Add Category Clicked");
    setCategories([
      ...categories.slice(0, -1),
      { name: `New ${categories.length - 1}`, icon: "file-plus" },
      { name: "add", icon: "plus" },
    ]);
  };

  // ฟังก์ชันแบ่งหมวดหมู่เป็น 2 แถวเสมอ
  const splitIntoTwoRows = (arr: any[]) => {
    if (!Array.isArray(arr) || arr.length === 0) return [[], []]; // ป้องกัน error ถ้า categories เป็น undefined
    const row1: any[] = [];
    const row2: any[] = [];
    arr.forEach((item, index) => {
      if (index % 2 === 0) {
        row1.push(item);
      } else {
        row2.push(item);
      }
    });
    return [row1, row2]; // ต้อง return array of arrays เสมอ
  };

  const categoryRows = splitIntoTwoRows(categories) ?? [[], []]; // ป้องกัน undefined

  const screenWidth = Dimensions.get("window").width; // ✅ ความกว้างของหน้าจอ
  const cardWidth = 280; // ✅ ความกว้างของ Card
  const cardMargin = 18; // ✅ Margin ระหว่างการ์ด
  const snapToInterval = cardWidth + cardMargin * 2; // ✅ ระยะ snap ให้เป๊ะ

  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedCard, setSelectedCard] = useState<resultObject | null>(null);
  const [cardPositions, setCardPositions] = useState<{ id: number; x: number }[]>([]);

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
        scrollViewRef.current?.scrollTo({ x: snapToInterval * (bank.length / 2 - 1), animated: true });
      }, 500);
    }
  }, [bank]);
 
  return (
    <ThemedView className="w-full !h-full flex-1">
      <ThemedView className="w-full !h-full flex-1">
        <ThemedView className="!items-start pl-10 w-full mt-5">
          <ThemedText className="text-[20px] font-bold mb-2">
            Account
          </ThemedText>
        </ThemedView>

        <ThemedView className="!items-center w-full mb-5 ">
        <ThemedScrollView
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
              {bank
                ?.slice() // ป้องกันไม่ให้เปลี่ยนค่า `bank` ดั้งเดิม
                .sort((a, b) => a.id - b.id) // เรียงจาก id น้อยไปมาก
                .map((account: resultObject, index: number) => (
              
                  <Pressable
                key={account.id}
                onLayout={(event) => {
                  const x = event.nativeEvent.layout.x +10+ event.nativeEvent.layout.width / 2;
                  storeCardPosition(account.id, x);
                }}
              >
                    <ThemedCard
                      key={account.id}
                      CardID={account.id}
                      name={account.account_name}
                      color={account.color_code}
                      balance={account.balance.toString()}
                      mode="large"
                      imageIndex={Number(account.icon_id)}
                      onEdit={() => {}}
                      className={`!items-center !justify-center bg-[#fefefe] rounded-lg  `}

                    />
                  </Pressable>

              ))}
            </ThemedView>
            </ThemedView>
          </ThemedScrollView>
        </ThemedView>

        <ThemedScrollView
          vertical={true}
          horizontal={false}
          className="w-full h-full"
        >
          <ThemedView
            className={`${
              theme === "dark" ? "bg-[#000000]" : "bg-[#ffffff]"
            } mt-2 px-10 !justify-start !items-start w-full  rounded-t-[30px] `}
            >
            <ThemedView className="flex-row w-fit h-12 rounded-sm p-1 mt-5 mb-4 bg-transparent">
            <Pressable
                onPress={() => setIsIncome(true)}
                className={`w-32 h-full flex items-center justify-center rounded-2xl ${
                  isIncome ? "bg-green-500" : "bg-transparent"
                }`}
              >
                <ThemedText className={`font-bold ${isIncome ? "text-white" : "text-black"}`}>
                  Income
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={() => setIsIncome(false)}
                className={`w-32 h-full flex items-center justify-center rounded-2xl ${
                  !isIncome ? "bg-red-500" : "bg-transparent"
                }`}
              >
                <ThemedText className={`font-bold ${!isIncome ? "text-white" : "text-black"}`}>
                  Expense
                </ThemedText>
              </Pressable>
            </ThemedView>

            <ThemedView className="w-full  bg-transparent">
              <ThemedText className="text-xl font-bold w-full !bg-transparent">
                Select Budget Plan
              </ThemedText>

              <ThemedView className="w-full bg-transparent">
                <DropdownComponent />
              </ThemedView>
            </ThemedView>

            <ThemedView className="mt-1 w-full justify-center !items-start bg-transparent">
              <ThemedText className="font-bold text-[16px]">
                Category
              </ThemedText>

              {/* Scroll แนวนอน แต่แบ่ง 2 แถว */}
              <ThemedScrollView
                horizontal
                className="h-[90px] w-full mt-3 bg-transparent"
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  flexDirection: "column",
                  rowGap: 4, // ลดช่องว่างระหว่างแถว
                  alignItems: "center", // จัดให้แถว 1 และ 2 เริ่มใกล้กันมากขึ้น
                }}
              >
                {/* 2 แถวแน่นอน */}
                {categoryRows.map((row, rowIndex) => (
                  <ThemedView key={rowIndex} className="flex-row gap-2 mb-2">
                    {row.map((category, index) => (
                      <Pressable
                        key={`${category.name}-${index}`}
                        onPress={() =>
                          category.name === "add"
                            ? addNewCategory()
                            : isIncome
                            ? setSelectedIncomeCategory(category.name)
                            : setSelectedExpenseCategory(category.name)
                        }
                        className={`px-4 py-2 rounded-lg flex-shrink-0 flex-row items-center gap-2 ${
                          category.name === "add"
                            ? "border border-black bg-transparent w-28 h-10 flex items-center justify-center"
                            : (isIncome ? selectedIncomeCategory : selectedExpenseCategory) === category.name
                            ? isIncome
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                            : "bg-gray-300 text-black"
                        }`}
                        style={{
                          flexBasis: "auto",
                          minWidth: 90,
                          paddingHorizontal: 12,
                        }}
                      >
                        {category.name === "add" ? (
                          <Icon name={category.icon} size={24} color="black" />
                        ) : (
                          <>
                            <Icon name={category.icon} size={18} color="black" />
                            <ThemedText className="font-bold">{category.name}</ThemedText>
                          </>
                        )}
                      </Pressable>
                    ))}
                  </ThemedView>
                ))}
              </ThemedScrollView>
            </ThemedView>

            <ThemedView className="w-full mt-4 justify-center !items-start bg-transparent">
              <ThemedText className="font-bold text-[16px] mb-2">
                Amount
              </ThemedText>
              <ThemedView className="w-full flex-row">
                <TextInput
                  placeholder="Enter Amount"
                  keyboardType="numeric"
                  className="h-10 bg-[#D9D9D9] text-[#2F2F2F] rounded-xl p-2 w-full"
                />
              </ThemedView>
            </ThemedView>


            <ThemedView className="w-full mt-4 justify-center !items-start bg-transparent">
              <ThemedText className="font-bold text-[16px] mb-2">
                Note
              </ThemedText>
              <ThemedView className="w-full flex-row">
                <TextInput
                  placeholder="Enter Note"
                  keyboardType="numeric"
                  className="h-10 bg-[#D9D9D9] text-[#2F2F2F] rounded-xl p-2 w-full"
                />
              </ThemedView>
            </ThemedView>
            <ThemedView
              className={`${
                theme === "dark" ? "bg-[#000000]" : "bg-[#ffffff]"
              }  px-10 w-full bg-transparent`}
            >
              <ThemedButton
                className="mt-28 mb-24 px-10 w-full  h-12 bg-green-500"
                onPress={() => router.push("/(tabs)/transaction")}
              >
                Add Transaction
              </ThemedButton>
            </ThemedView>
          </ThemedView>
        </ThemedScrollView>
      </ThemedView>
    </ThemedView>
  );
}
