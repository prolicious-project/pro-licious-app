import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  Colors,
  Radius,
  Spacing,
} from "../../constants/theme";

type Category = {
  id: number;
  name: string;
};

type Props = {
  categories: Category[];
  selected?: number;
  onSelect: (id: number) => void;
};

export default function CategoryPicker({
  categories,
  selected,
  onSelect,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => {
        const active = selected === category.id;

        return (
          <TouchableOpacity
            key={category.id}
            onPress={() => onSelect(category.id)}
            style={[
              styles.chip,
              active && styles.activeChip,
            ]}
          >
            <Text
              style={[
                styles.text,
                active && styles.activeText,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.lg,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.gray200,
    marginRight: 10,
  },

  activeChip: {
    backgroundColor: Colors.red,
    borderColor: Colors.red,
  },

  text: {
    fontWeight: "700",
    color: Colors.textPrimary,
    fontSize: 13,
  },

  activeText: {
    color: "#fff",
  },
});