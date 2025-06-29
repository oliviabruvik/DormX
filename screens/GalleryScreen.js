import React from 'react';
import { 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    View,
    Text,
    useColorScheme,
    Image,
    useWindowDimensions
  } from "react-native";
import Colors from '../constants/Colors';

export default function GalleryScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const { width: windowWidth } = useWindowDimensions();
  
    // Albums with name of event and a cover image
    const images = [
        { id: 1, title: "Bim's Birthday", source: require('../assets/images/event1.jpg')},
        { id: 2, title: "Yosemite trip", source: require('../assets/images/event2.jpg')},
        { id: 3, title: "Topgolf", source: require('../assets/images/event3.jpg')},
        { id: 4, title: "Half moon bay trip", source: require('../assets/images/event4.jpg')},
        { id: 5, title: "Frisbee tournament", source: require('../assets/images/event7.jpeg')},
        { id: 6, title: "Monterey trip", source: require('../assets/images/event9.jpg')},
      ];

      // Calculate layout dimensions based on screen width
    const getImageLayout = () => {
        const padding = 16;
        const screenPadding = 20;
        const availableWidth = windowWidth - (screenPadding * 2);
        
        if (images.length === 1) {
        // One image takes almost full width
        return {
            containerStyle: { width: availableWidth },
            imageStyle: { width: availableWidth, height: availableWidth }
        };
        } else if (images.length === 2) {
        // Two images stacked vertically with same size as single image
        return {
            containerStyle: { width: availableWidth },
            imageStyle: { width: availableWidth, height: availableWidth / 2 - padding / 2 }
        };
        } else {
        // Grid layout with two columns
        const itemWidth = (availableWidth - padding) / 2;
        return {
            containerStyle: { width: itemWidth },
            imageStyle: { width: itemWidth, height: itemWidth }
        };
        }
    };
    
    // Render grid of photo collections
    const renderPhotoAlbumItems = () => {
        const { containerStyle, imageStyle } = getImageLayout();
        if (images.length <= 2) {
            return (
                <View style={styles.singleColumnContainer}>
                  {images.map((item) => (
                    <PhotoAlbumItem
                      key={item.id}
                      title={item.title}
                      imageSource={item.source}
                      containerStyle={containerStyle}
                      imageStyle={imageStyle}
                    />
                  ))}
                </View>
              );
        } else {
            return (
                <View style={styles.gridContainer}>
                  {images.map((item) => (
                    <PhotoAlbumItem
                      key={item.id}
                      title={item.title}
                      imageSource={item.source}
                      containerStyle={containerStyle}
                      imageStyle={imageStyle}
                    />
                  ))}
                </View>
              );
        }
    };

    return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
            {renderPhotoAlbumItems()}
        </ScrollView>
    </View>
    );
}

const PhotoAlbumItem = ({ title, imageSource, containerStyle, imageStyle, onPress }) => (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.galleryItem, containerStyle]}>
      <Image
        source={imageSource}
        style={[styles.galleryImage, imageStyle]}
        resizeMode="cover"
      />
      <Text style={styles.galleryTitle}
        numberOfLines={2}
        ellipsizeMode="tail">{title}</Text>
    </TouchableOpacity>
  );

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
    },
    singleColumnContainer: {
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 16,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 0,
    },
    galleryItem: {
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
      shadowColor: "#222",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    galleryImage: {
      borderRadius: 8,
    },
    galleryTitle: {
      marginTop: 8,
      textAlign: "center",
      fontWeight: "500",
      color: "white",
    },
  });