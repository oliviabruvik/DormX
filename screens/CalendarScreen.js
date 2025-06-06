// screens/CalendarScreen.js - Enhanced Calendar with State Management
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  useColorScheme,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

// Enhanced Icons
const ChevronLeftIcon = ({ color = "#666", size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChevronRightIcon = ({ color = "#666", size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PlusIcon = ({ color = "#fff", size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14m-7-7h14" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ClockIcon = ({ color = "#666", size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const LocationIcon = ({ color = "#666", size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke={color} strokeWidth={2} />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth={2} />
  </Svg>
);

const CalendarIcon = ({ color = "#666", size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={color} strokeWidth={2} />
    <Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth={2} />
  </Svg>
);

const StarIcon = ({ color = "#FFD700", size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

// Event categories with colors
const EVENT_CATEGORIES = {
  personal: { color: '#7B5AFF', icon: '👤', label: 'Personal' },
  study: { color: '#4ECDC4', icon: '📚', label: 'Study' },
  dorm: { color: '#FF6B6B', icon: '🏠', label: 'Dorm' },
  class: { color: '#FFD93D', icon: '🎓', label: 'Class' },
  social: { color: '#6BCF7F', icon: '🎉', label: 'Social' },
  reminder: { color: '#FF8A65', icon: '⏰', label: 'Reminder' },
};

export default function CalendarScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";
  const { userInfo } = useAuth();

  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal state
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventCategory, setEventCategory] = useState('personal');
  const [isPublic, setIsPublic] = useState(false);

  // Calendar utilities
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Load events from AsyncStorage (simulating database)
  const loadEvents = useCallback(async () => {
    try {
      const storedEvents = await AsyncStorage.getItem(`events_${userInfo?.id || 'default'}`);
      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents).map(event => ({
          ...event,
          event_date: new Date(event.event_date),
          end_date: event.end_date ? new Date(event.end_date) : null,
        }));
        setEvents(parsedEvents);
      } else {
        // Initialize with sample events
        const sampleEvents = [
          {
            id: '1',
            title: 'Study Group - Advanced Math',
            description: 'Final exam preparation session',
            event_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            end_date: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // +2 hours
            location: 'Library Room 204',
            category: 'study',
            is_public: false,
            user_id: userInfo?.id || 'default',
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            title: 'Dorm Pizza Night',
            description: 'Monthly community gathering',
            event_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // +3 hours
            location: 'Common Room',
            category: 'social',
            is_public: true,
            user_id: userInfo?.id || 'default',
            created_at: new Date().toISOString(),
          },
          {
            id: '3',
            title: 'Laundry Day',
            description: 'Don\'t forget to pick up clothes!',
            event_date: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
            location: 'Laundry Room B1',
            category: 'reminder',
            is_public: false,
            user_id: userInfo?.id || 'default',
            created_at: new Date().toISOString(),
          },
        ];
        setEvents(sampleEvents);
        await saveEvents(sampleEvents);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }, [userInfo?.id]);

  // Save events to AsyncStorage
  const saveEvents = async (eventsToSave) => {
    try {
      await AsyncStorage.setItem(
        `events_${userInfo?.id || 'default'}`,
        JSON.stringify(eventsToSave)
      );
    } catch (error) {
      console.error('Error saving events:', error);
    }
  };

  // Initialize events on mount
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }, [loadEvents]);

  // Calendar utilities
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const getEventsForDate = (date) => {
    return events.filter(event => isSameDay(event.event_date, date));
  };

  const getNextEvent = () => {
    const now = new Date();
    const upcomingEvents = events
      .filter(event => event.event_date > now)
      .sort((a, b) => a.event_date - b.event_date);
    return upcomingEvents[0] || null;
  };

  const getTimeUntilEvent = (eventDate) => {
    const now = new Date();
    const diff = eventDate - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `in ${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `in ${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `in ${minutes}m`;
    } else {
      return 'starting now';
    }
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Event management
  const openAddEventModal = () => {
    setEditingEvent(null);
    setEventTitle('');
    setEventDescription('');
    setEventTime('09:00');
    setEventLocation('');
    setEventCategory('personal');
    setIsPublic(false);
    setShowAddEventModal(true);
  };

  const openEditEventModal = (event) => {
    setEditingEvent(event);
    setEventTitle(event.title);
    setEventDescription(event.description || '');
    setEventTime(event.event_date.toTimeString().slice(0, 5));
    setEventLocation(event.location || '');
    setEventCategory(event.category || 'personal');
    setIsPublic(event.is_public || false);
    setShowAddEventModal(true);
  };

  const saveEvent = async () => {
    if (!eventTitle.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    try {
      const [hours, minutes] = eventTime.split(':');
      const eventDate = new Date(selectedDate);
      eventDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const eventData = {
        id: editingEvent?.id || Date.now().toString(),
        title: eventTitle.trim(),
        description: eventDescription.trim(),
        event_date: eventDate,
        end_date: null, // Could be enhanced to support end dates
        location: eventLocation.trim(),
        category: eventCategory,
        is_public: isPublic,
        user_id: userInfo?.id || 'default',
        created_at: editingEvent?.created_at || new Date().toISOString(),
      };

      let updatedEvents;
      if (editingEvent) {
        updatedEvents = events.map(event => 
          event.id === editingEvent.id ? eventData : event
        );
      } else {
        updatedEvents = [...events, eventData];
      }

      setEvents(updatedEvents);
      await saveEvents(updatedEvents);
      
      setShowAddEventModal(false);
      Alert.alert('Success', `Event ${editingEvent ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error saving event:', error);
      Alert.alert('Error', 'Failed to save event');
    }
  };

  const deleteEvent = async (eventId) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedEvents = events.filter(event => event.id !== eventId);
            setEvents(updatedEvents);
            await saveEvents(updatedEvents);
          }
        }
      ]
    );
  };

  // Render calendar grid
  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.calendarDay} />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isSelected = isSameDay(date, selectedDate);
      const isToday = isSameDay(date, new Date());
      const dayEvents = getEventsForDate(date);

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            isSelected && styles.selectedDay,
            isToday && styles.todayDay,
          ]}
          onPress={() => setSelectedDate(date)}
        >
          <Text style={[
            styles.calendarDayText,
            { color: Colors[theme].text },
            isSelected && styles.selectedDayText,
            isToday && styles.todayDayText,
          ]}>
            {day}
          </Text>
          {dayEvents.length > 0 && (
            <View style={styles.eventIndicatorContainer}>
              {dayEvents.slice(0, 3).map((event, index) => (
                <View
                  key={event.id}
                  style={[
                    styles.eventIndicatorDot,
                    { backgroundColor: EVENT_CATEGORIES[event.category]?.color || '#7B5AFF' }
                  ]}
                />
              ))}
              {dayEvents.length > 3 && (
                <Text style={styles.moreEventsText}>+{dayEvents.length - 3}</Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return days;
  };

  // Render next event card
  const renderNextEventCard = () => {
    const nextEvent = getNextEvent();
    
    if (!nextEvent) {
      return (
        <View style={[styles.nextEventCard, { backgroundColor: Colors[theme].cardBackground }]}>
          <View style={styles.nextEventHeader}>
            <StarIcon size={20} />
            <Text style={[styles.nextEventTitle, { color: Colors[theme].text }]}>
              Next Event
            </Text>
          </View>
          <Text style={[styles.noNextEventText, { color: Colors[theme].text }]}>
            No upcoming events
          </Text>
          <Text style={[styles.noNextEventSubtext, { color: Colors[theme].text }]}>
            Create your first event!
          </Text>
        </View>
      );
    }

    const category = EVENT_CATEGORIES[nextEvent.category] || EVENT_CATEGORIES.personal;
    
    return (
      <TouchableOpacity
        style={[styles.nextEventCard, { backgroundColor: Colors[theme].cardBackground }]}
        onPress={() => openEditEventModal(nextEvent)}
      >
        <LinearGradient
          colors={[category.color + '20', category.color + '10']}
          style={styles.nextEventGradient}
        >
          <View style={styles.nextEventHeader}>
            <View style={styles.nextEventIcon}>
              <Text style={styles.nextEventEmoji}>{category.icon}</Text>
            </View>
            <View style={styles.nextEventInfo}>
              <Text style={[styles.nextEventLabel, { color: Colors[theme].text }]}>
                Next Event
              </Text>
              <Text style={[styles.nextEventTime, { color: category.color }]}>
                {getTimeUntilEvent(nextEvent.event_date)}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.nextEventTitle, { color: Colors[theme].text }]}>
            {nextEvent.title}
          </Text>
          
          <View style={styles.nextEventDetails}>
            <View style={styles.nextEventDetailItem}>
              <ClockIcon color={Colors[theme].text} size={14} />
              <Text style={[styles.nextEventDetailText, { color: Colors[theme].text }]}>
                {nextEvent.event_date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            {nextEvent.location && (
              <View style={styles.nextEventDetailItem}>
                <LocationIcon color={Colors[theme].text} size={14} />
                <Text style={[styles.nextEventDetailText, { color: Colors[theme].text }]}>
                  {nextEvent.location}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Render events for selected date
  const renderEvents = () => {
    const selectedEvents = getEventsForDate(selectedDate);

    if (selectedEvents.length === 0) {
      return (
        <View style={styles.noEventsContainer}>
          <CalendarIcon color={Colors[theme].text} size={48} />
          <Text style={[styles.noEventsText, { color: Colors[theme].text }]}>
            No events for this day
          </Text>
          <Text style={[styles.noEventsSubtext, { color: Colors[theme].text }]}>
            Tap the + button to add an event
          </Text>
        </View>
      );
    }

    return selectedEvents
      .sort((a, b) => a.event_date - b.event_date)
      .map((event) => {
        const category = EVENT_CATEGORIES[event.category] || EVENT_CATEGORIES.personal;
        
        return (
          <TouchableOpacity
            key={event.id}
            style={[styles.eventCard, { backgroundColor: Colors[theme].cardBackground }]}
            onPress={() => openEditEventModal(event)}
            onLongPress={() => deleteEvent(event.id)}
          >
            <View style={[styles.eventColorBar, { backgroundColor: category.color }]} />
            <View style={styles.eventContent}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventEmoji}>{category.icon}</Text>
                <View style={styles.eventTitleContainer}>
                  <Text style={[styles.eventTitle, { color: Colors[theme].text }]}>
                    {event.title}
                  </Text>
                  <Text style={[styles.eventCategoryLabel, { color: category.color }]}>
                    {category.label}
                  </Text>
                </View>
                {event.is_public && (
                  <View style={styles.publicBadge}>
                    <Text style={styles.publicBadgeText}>Public</Text>
                  </View>
                )}
              </View>
              
              {event.description && (
                <Text style={[styles.eventDescription, { color: Colors[theme].text }]}>
                  {event.description}
                </Text>
              )}
              
              <View style={styles.eventDetails}>
                <View style={styles.eventDetailItem}>
                  <ClockIcon color={Colors[theme].text} size={16} />
                  <Text style={[styles.eventDetailText, { color: Colors[theme].text }]}>
                    {event.event_date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                {event.location && (
                  <View style={styles.eventDetailItem}>
                    <LocationIcon color={Colors[theme].text} size={16} />
                    <Text style={[styles.eventDetailText, { color: Colors[theme].text }]}>
                      {event.location}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[theme].text }]}>
            Loading calendar...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      {/* Enhanced Header */}
      <LinearGradient
        colors={["#7B5AFF", "#3B1AFA"]}
        style={styles.enhancedHeader}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation?.goBack()}
          >
            <ChevronLeftIcon color="white" size={24} />
            <Text style={styles.backButtonText}>Home</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calendar</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.headerSubtitle}>
          {events.length} event{events.length !== 1 ? 's' : ''} total
        </Text>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Next Event Card */}
        {renderNextEventCard()}

        {/* Calendar Navigation */}
        <View style={[styles.calendarHeader, { backgroundColor: Colors[theme].cardBackground }]}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <ChevronLeftIcon color={Colors[theme].text} />
          </TouchableOpacity>
          
          <View style={styles.monthYearContainer}>
            <Text style={[styles.monthYear, { color: Colors[theme].text }]}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <ChevronRightIcon color={Colors[theme].text} />
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={[styles.calendarContainer, { backgroundColor: Colors[theme].cardBackground }]}>
          {/* Day headers */}
          <View style={styles.dayHeaders}>
            {dayNames.map((day) => (
              <Text key={day} style={[styles.dayHeader, { color: Colors[theme].text }]}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar days */}
          <View style={styles.calendarGrid}>
            {renderCalendarGrid()}
          </View>
        </View>

        {/* Selected Date Header */}
        <View style={styles.selectedDateHeader}>
          <Text style={[styles.selectedDateText, { color: Colors[theme].text }]}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          <Text style={[styles.selectedDateCount, { color: Colors[theme].text }]}>
            {getEventsForDate(selectedDate).length} event{getEventsForDate(selectedDate).length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Events List */}
        <View style={styles.eventsContainer}>
          {renderEvents()}
        </View>
      </ScrollView>

      {/* Add Event Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={openAddEventModal}
      >
        <LinearGradient
          colors={["#7B5AFF", "#3B1AFA"]}
          style={styles.addButtonGradient}
        >
          <PlusIcon />
        </LinearGradient>
      </TouchableOpacity>

      {/* Add/Edit Event Modal */}
      <Modal
        visible={showAddEventModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: Colors[theme].background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddEventModal(false)}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: Colors[theme].text }]}>
              {editingEvent ? 'Edit Event' : 'Add Event'}
            </Text>
            <TouchableOpacity onPress={saveEvent}>
              <Text style={styles.modalSaveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: Colors[theme].text }]}>Title *</Text>
              <TextInput
                style={[styles.formInput, { 
                  backgroundColor: Colors[theme].cardBackground,
                  color: Colors[theme].text,
                  borderColor: Colors[theme].text + '20'
                }]}
                value={eventTitle}
                onChangeText={setEventTitle}
                placeholder="Event title"
                placeholderTextColor={Colors[theme].text + '60'}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: Colors[theme].text }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
                {Object.entries(EVENT_CATEGORIES).map(([key, category]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.categoryOption,
                      { backgroundColor: eventCategory === key ? category.color : Colors[theme].cardBackground },
                      { borderColor: category.color }
                    ]}
                    onPress={() => setEventCategory(key)}
                  >
                    <Text style={styles.categoryEmoji}>{category.icon}</Text>
                    <Text style={[
                      styles.categoryLabel,
                      { color: eventCategory === key ? 'white' : Colors[theme].text }
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: Colors[theme].text }]}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea, { 
                  backgroundColor: Colors[theme].cardBackground,
                  color: Colors[theme].text,
                  borderColor: Colors[theme].text + '20'
                }]}
                value={eventDescription}
                onChangeText={setEventDescription}
                placeholder="Event description"
                placeholderTextColor={Colors[theme].text + '60'}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={[styles.formLabel, { color: Colors[theme].text }]}>Time</Text>
                <TextInput
                  style={[styles.formInput, { 
                    backgroundColor: Colors[theme].cardBackground,
                    color: Colors[theme].text,
                    borderColor: Colors[theme].text + '20'
                  }]}
                  value={eventTime}
                  onChangeText={setEventTime}
                  placeholder="HH:MM"
                  placeholderTextColor={Colors[theme].text + '60'}
                />
              </View>
              
              <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={[styles.formLabel, { color: Colors[theme].text }]}>Public Event</Text>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    { backgroundColor: isPublic ? '#4ECDC4' : Colors[theme].cardBackground },
                    { borderColor: Colors[theme].text + '20' }
                  ]}
                  onPress={() => setIsPublic(!isPublic)}
                >
                  <Text style={[
                    styles.toggleButtonText,
                    { color: isPublic ? 'white' : Colors[theme].text }
                  ]}>
                    {isPublic ? 'Yes' : 'No'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: Colors[theme].text }]}>Location</Text>
              <TextInput
                style={[styles.formInput, { 
                  backgroundColor: Colors[theme].cardBackground,
                  color: Colors[theme].text,
                  borderColor: Colors[theme].text + '20'
                }]}
                value={eventLocation}
                onChangeText={setEventLocation}
                placeholder="Event location"
                placeholderTextColor={Colors[theme].text + '60'}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: Colors[theme].text }]}>Date</Text>
              <View style={[styles.selectedDateDisplay, { 
                backgroundColor: Colors[theme].cardBackground,
                borderColor: Colors[theme].text + '20'
              }]}>
                <CalendarIcon color={Colors[theme].text} size={20} />
                <Text style={[styles.selectedDateDisplayText, { color: Colors[theme].text }]}>
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
            </View>

            {editingEvent && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  setShowAddEventModal(false);
                  deleteEvent(editingEvent.id);
                }}
              >
                <Text style={styles.deleteButtonText}>Delete Event</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  enhancedHeader: {
    paddingTop: 10,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
  headerSpacer: {
    width: 60, // Balance the back button
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "rgba(240, 213, 220, 0.9)",
    // put in center
    textAlign: 'center',
    flex: 1,
    marginTop: 25,
    marginRight: 20, // Space for back button
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgb(228, 205, 113)",
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  nextEventCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  nextEventGradient: {
    padding: 20,
  },
  nextEventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  nextEventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  nextEventEmoji: {
    fontSize: 20,
  },
  nextEventInfo: {
    flex: 1,
  },
  nextEventLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nextEventTime: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  nextEventTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  nextEventDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  nextEventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextEventDetailText: {
    fontSize: 14,
    opacity: 0.8,
  },
  noNextEventText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
  },
  noNextEventSubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 4,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
  },
  monthYearContainer: {
    alignItems: 'center',
  },
  monthYear: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  todayButton: {
    backgroundColor: '#7B5AFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  todayButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  calendarContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedDay: {
    backgroundColor: '#7B5AFF',
  },
  todayDay: {
    backgroundColor: '#4ECDC4',
  },
  calendarDayText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedDayText: {
    color: 'white',
  },
  todayDayText: {
    color: 'white',
  },
  eventIndicatorContainer: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  eventIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  moreEventsText: {
    fontSize: 8,
    color: '#666',
    marginLeft: 2,
  },
  selectedDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '700',
  },
  selectedDateCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  eventsContainer: {
    marginBottom: 80,
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noEventsText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
  },
  noEventsSubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
  eventCard: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventColorBar: {
    width: 6,
  },
  eventContent: {
    flex: 1,
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  eventTitleContainer: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  eventCategoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  publicBadge: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  publicBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
    lineHeight: 20,
  },
  eventDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDetailText: {
    fontSize: 12,
    opacity: 0.8,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#7B5AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalCancelButton: {
    color: '#666',
    fontSize: 16,
  },
  modalSaveButton: {
    color: '#7B5AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  formInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  formTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categorySelector: {
    marginTop: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  toggleButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedDateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  selectedDateDisplayText: {
    fontSize: 16,
    marginLeft: 12,
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});