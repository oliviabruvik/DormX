import React, { useRef, useEffect, useState } from "react";
import { 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Animated, 
  Easing,
  useColorScheme,
  Modal,
  Alert
} from "react-native";
import { Text, View } from "../components/Themed";
import Svg, { Circle, Path, Rect, G } from "react-native-svg";
import Colors from "../constants/Colors";
import { Avatar, Button, Card, Title, Paragraph, Searchbar, Text as PaperText, TextInput } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

import { PaperProvider } from 'react-native-paper';

// Search bar component
const ClassSearchBar = ({ onClassAdded }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        instructor_name: '',
    });
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? 'dark' : 'light';

    const searchClasses = async (query) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('classes')
                .select('*')
                .ilike('name', `${query}%`)
                .limit(5);

            if (error) throw error;
            setSearchResults(data || []);
        } catch (error) {
            console.error('Error searching classes:', error);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        searchClasses(query);
        setShowResults(true);
    };

    const handleSelectClass = (classItem) => {
        // console.log('Selected class:', classItem);
        setShowResults(false);
        setSearchQuery('');
    };

    const handleAddNewClass = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Error', 'Please enter a class name');
            return;
        }

        if (formData.instructor_name.trim() === '') {
            Alert.alert('Error', 'Please enter an instructor name');
            return;
        }

        if (formData.name.length < 3) {
            Alert.alert('Error', 'Class name must be at least 3 characters');
            return;
        }

        if (formData.name.length > 50) {
            Alert.alert('Error', 'Class name must be less than 50 characters');
            return;
        }

        try {
            const { data: newClass, error: classError } = await supabase
                .from('classes')
                .insert([
                    {
                        name: formData.name.trim(),
                        instructor_name: formData.instructor_name.trim(),
                        instructor_id: user.id,
                        current_students: 0,
                        is_active: true,
                        created_at: new Date().toISOString()
                    }
                ])
                .select()
                .single();

            if (classError) {
                console.error('Error creating class:', classError);
                Alert.alert('Error', 'Failed to create class');
                return;
            }

            Alert.alert('Success', 'Class created successfully!');

            try {
              // Create a channel for the class
              const { data: newChannel, error: channelError } = await supabase
                  .from('channels')
                  .insert([
                      {
                          id: newClass.id,
                          name: newClass.name.trim(),
                          description: newClass.instructor_name.trim(),
                          is_private: false,
                          created_by: user.id
                      }
                  ])
                  .select()
                  .single();

              if (channelError) {
                  console.error('Error creating channel:', channelError);
                  Alert.alert('Error', 'Failed to create channel.')
                  return;
              }
            } catch (error) {
                console.error('Unexpected error:', error);
                Alert.alert('Error', 'An unexpected error occurred');
            }

            setModalVisible(false);
            setFormData({
                name: '',
                instructor_name: '',
            });
            setSearchQuery('');
            setShowResults(false);
            onClassAdded();
        } catch (error) {
            console.error('Unexpected error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        }
    };

    const updateFormData = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <View style={styles.searchContainer}>
            <Searchbar
                placeholder="Search classes..."
                onChangeText={handleSearch}
                value={searchQuery}
                style={styles.searchBar}
            />
            {showResults && searchQuery.length >= 2 && (
                <Card style={styles.searchResults}>
                    <ScrollView>
                        {searchResults.map((result) => (
                            <TouchableOpacity
                                key={result.id}
                                style={styles.searchResultItem}
                                onPress={() => handleSelectClass(result)}
                            >
                                <Text>{result.name}</Text>
                                <Text style={styles.professorText}>{result.instructor_name}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.addNewItem}
                            onPress={() => {
                                setFormData(prev => ({ ...prev, name: searchQuery }));
                                setModalVisible(true);
                            }}
                        >
                            <Text style={styles.addNewText}>Add Class "{searchQuery}"</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </Card>
            )}

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: Colors[theme].background }]}>
                        <View style={styles.modalHeader}>
                            <PaperText style={[styles.modalTitle, { color: Colors[theme].text }]}>Add New Class</PaperText>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <PaperText style={[styles.closeButton, { color: Colors[theme].text }]}>✕</PaperText>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formContainer}>
                            <TextInput
                                // label="Class Name *"
                                value={formData.name}
                                onChangeText={(value) => updateFormData('name', value)}
                                style={styles.input}
                                mode="outlined"
                                placeholder="e.g., English 91"
                                textColor={Colors[theme].text}
                                theme={{ colors: { text: Colors[theme].text } }}
                            />
                            <TextInput
                                // label="Instructor Name"
                                value={formData.instructor_name}
                                onChangeText={(value) => updateFormData('instructor_name', value)}
                                style={styles.input}
                                mode="outlined"
                                placeholder="Enter instructor's name"
                                textColor={Colors[theme].text}
                                theme={{ colors: { text: Colors[theme].text } }}
                            />
                            <Button
                                mode="contained"
                                onPress={handleAddNewClass}
                                style={styles.submitButton}
                            >
                                Create Class
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// Header component
const ClassHeader = () => {
    return (
        <View style={styles.header}>
            <PaperText style={styles.headerText}>My Classes</PaperText>
        </View>
    );
};

// Folder icon component
const LeftContent = props => <Avatar.Icon {...props} icon="folder" />

// Class item component
const ClassItem = ({ title, subtitle, numStudents, onEnterCommunity, isEnrolled, onGoToChannel }) => {
    return (
    <Card style={styles.card}>
        <Card.Title title={title} subtitle={subtitle} left={LeftContent} />
        <Card.Content>
            <PaperText variant="bodyMedium">Number of Students: {numStudents}</PaperText>
        </Card.Content>
        <Card.Actions>
            {isEnrolled && (
                <Button 
                    mode="contained"
                    onPress={onGoToChannel}
                    style={[styles.actionButton, { backgroundColor: Colors.primary }]}
                    textColor="white"
                >
                    Go to Channel
                </Button>
            )}
            <Button 
                mode={isEnrolled ? "contained" : "outlined"}
                onPress={onEnterCommunity}
                style={[
                    styles.actionButton, 
                    isEnrolled ? { backgroundColor: Colors.primary } : { borderColor: Colors.primary }
                ]}
                textColor={isEnrolled ? "white" : Colors.primary}
            >
                {isEnrolled ? 'Leave Community' : 'Enter Community'}
            </Button>
        </Card.Actions>
    </Card>
    );
};

// Class screen
export default function ClassScreen({ navigation }) {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? 'dark' : 'light';
    const [classes, setClasses] = useState([]);
    const [enrollments, setEnrollments] = useState({});
    const { user } = useAuth();
    
    const loadEnrollments = async () => {
        if (!user) return;
        
        try {
            const { data, error } = await supabase
                .from('class_enrollments')
                .select('class_id')
                .eq('user_id', user.id);

            if (error) {
                console.error('Error loading enrollments:', error);
                return;
            }

            // Create a map of class_id -> true for quick lookup
            const enrollmentMap = {};
            data.forEach(enrollment => {
                enrollmentMap[enrollment.class_id] = true;
            });
            setEnrollments(enrollmentMap);
        } catch (error) {
            console.error('Unexpected error loading enrollments:', error);
        }
    };
    
    const loadClasses = async () => {
        try {
            const { data, error } = await supabase
                .from('classes')
                .select('*')
                .eq('is_active', true)
                .order('name', { ascending: true });

            if (error) {
                console.error('Error loading classes:', error);
                Alert.alert('Error', 'Failed to load classes');
                return;
            }

            setClasses(data || []);
        } catch (error) {
            console.error('Unexpected error loading classes:', error);
            Alert.alert('Error', 'Failed to load classes');
        }
    };

    // Load classes and enrollments when component mounts
    useEffect(() => {
        loadClasses();
        loadEnrollments();
    }, []);

    const handleEnterCommunity = async (classItem) => {
        try {
            console.log('Pressed Enter Community');
            console.log('Current enrollments:', enrollments);
            console.log('Is enrolled:', enrollments[classItem.id]);

            if (!user || !user.id) {
                console.error('No user found');
                Alert.alert('Error', 'You must be logged in to join a class');
                return;
            }

            const isEnrolled = enrollments[classItem.id];

            if (isEnrolled) {
                console.log('Leaving class:', classItem.id);
                
                // First, delete from class_enrollments table
                const { data: deleteData, error: leaveError } = await supabase
                    .from('class_enrollments')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('class_id', classItem.id)
                    .select();

                console.log('Delete result:', { deleteData, leaveError });

                if (leaveError) {
                    console.error('Error removing from class_enrollments:', leaveError);
                    Alert.alert('Error', 'Failed to leave class');
                    return;
                }

                // Then update the class student count
                const { data: updateData, error: updateError } = await supabase
                    .from('classes')
                    .update({ 
                        current_students: Math.max(0, classItem.current_students - 1)
                    })
                    .eq('id', classItem.id)
                    .select();

                console.log('Update result:', { updateData, updateError });

                if (updateError) {
                    console.error('Error updating class student count:', updateError);
                    // Try to re-add the enrollment since the count update failed
                    const { error: reAddError } = await supabase
                        .from('class_enrollments')
                        .insert([
                            {
                                user_id: user.id,
                                class_id: classItem.id,
                                enrollment_date: new Date().toISOString()
                            }
                        ]);
                    console.log('Re-add result:', { reAddError });
                    Alert.alert('Error', 'Failed to update class');
                    return;
                }

                // Update enrollments state immediately
                setEnrollments(prev => {
                    const newEnrollments = { ...prev };
                    delete newEnrollments[classItem.id];
                    console.log('Updated enrollments after leaving:', newEnrollments);
                    return newEnrollments;
                });

                // Remove the user from the channel
                const { error: memberError } = await supabase
                    .from('chat_members')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('channel_id', classItem.id);

                if (memberError) {
                    console.error('Error removing user from channel:', memberError);
                }

                Alert.alert('Success', 'Successfully left class!');
            } else {
                console.log('Joining class:', classItem.id);
                // First, check if enrollment already exists
                const { data: existingEnrollment, error: checkError } = await supabase
                    .from('class_enrollments')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('class_id', classItem.id)
                    .single();

                console.log('Existing enrollment check:', { existingEnrollment, checkError });

                if (checkError && checkError.code !== 'PGRST116') {
                    console.error('Error checking enrollment:', checkError);
                    Alert.alert('Error', 'Failed to check enrollment status');
                    return;
                }

                if (existingEnrollment) {
                    console.log('Enrollment already exists');
                    setEnrollments(prev => {
                        const newEnrollments = { ...prev, [classItem.id]: true };
                        console.log('Updated enrollments after finding existing:', newEnrollments);
                        return newEnrollments;
                    });
                    return;
                }

                // Add to class_enrollments table
                const { data: insertData, error: enrollError } = await supabase
                    .from('class_enrollments')
                    .insert([
                        {
                            user_id: user.id,
                            class_id: classItem.id,
                            enrollment_date: new Date().toISOString()
                        }
                    ])
                    .select();

                // console.log('Insert result:', { insertData, enrollError });

                if (enrollError) {
                    console.error('Error adding to class_enrollments:', enrollError);
                    Alert.alert('Error', 'Failed to join class');
                    return;
                }

                // Then update the class student count
                const { data: updateData, error: updateError } = await supabase
                    .from('classes')
                    .update({ 
                        current_students: classItem.current_students + 1
                    })
                    .eq('id', classItem.id)
                    .select();

                // console.log('Update result:', { updateData, updateError });

                if (updateError) {
                    console.error('Error updating class student count:', updateError);
                    // Remove the enrollment since the count update failed
                    const { error: removeError } = await supabase
                        .from('class_enrollments')
                        .delete()
                        .eq('user_id', user.id)
                        .eq('class_id', classItem.id);
                    console.log('Remove result after failed update:', { removeError });
                    Alert.alert('Error', 'Failed to update class');
                    return;
                }

                // Add the user to the channel
                const { error: memberError } = await supabase
                    .from('chat_members')
                    .insert([
                        {
                            user_id: user.id,
                            channel_id: classItem.id,
                            joined_at: new Date().toISOString()
                        }
                    ]);

                if (memberError) {
                    console.error('Error joining user to channel:', memberError);
                }

                // Update enrollments state immediately
                setEnrollments(prev => {
                    const newEnrollments = { ...prev, [classItem.id]: true };
                    console.log('Updated enrollments after joining:', newEnrollments);
                    return newEnrollments;
                });

                Alert.alert('Success', 'Successfully joined class!');
            }

            // Refresh classes list
            await loadClasses();
            
        } catch (error) {
            console.error('Unexpected error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        }
    };

    // Render grid of features
    const renderClasses = () => {
        return classes.map((classItem) => (
            <ClassItem
                key={classItem.id}
                title={classItem.name}
                subtitle={classItem.instructor_name}
                numStudents={classItem.current_students}
                onEnterCommunity={() => handleEnterCommunity(classItem)}
                isEnrolled={enrollments[classItem.id]}
                onGoToChannel={() => navigation.navigate('ChatsScreen', { channelName: classItem.name })}
            />
        ));
    };

    // Chat press handler
    const handleChatPress = () => {
        console.log('Pressed Chats');
        navigation.navigate('ChatsScreen');
    };

    // Chat press handler
    const handleGalleryPress = () => {
        console.log('Pressed Gallery');
        navigation.navigate('GalleryScreen');
    };

    return (
        <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* //<ClassHeader /> */}
                <ClassSearchBar onClassAdded={loadClasses} />
                <View style={styles.classesContainer}>{renderClasses()}</View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  classesContainer: {
    paddingBottom: 20,
  },
  header: {
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  headerText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 24,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  searchContainer: {
    position: 'relative',
    zIndex: 1,
  },
  searchBar: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  searchResults: {
    position: 'absolute',
    top: '100%',
    left: 16,
    right: 16,
    maxHeight: 300,
    zIndex: 2,
  },
  searchResultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  addNewItem: {
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  addNewText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  professorText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formContainer: {
    gap: 15,
    maxHeight: '80%',
  },
  input: {
    backgroundColor: 'transparent',
    marginBottom: 10,
  },
  submitButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  actionButton: {
    marginHorizontal: 8,
  },
});