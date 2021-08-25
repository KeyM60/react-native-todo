import React, { useState } from 'react';
import styled, { ThemeProvider } from 'styled-components/native';
import { theme } from './theme';
import { StatusBar, useWindowDimensions } from 'react-native';
import Input from './components/Input';
import IconButton from './components/IconButton';
import { images } from './images';
import Task from './components/Task';
import AsyncStorage from '@react-native-community/async-storage';
import AppLoading from 'expo-app-loading';

const Container = styled.View`
    flex : 1;
    background-color : ${({ theme }) => theme.background};
    align-items : center;
    justify-content : flex-start;
    `;

const Title = styled.Text`
    font-size : 40px;
    font-weight : 600;
    color : ${({ theme }) => theme.main};
    align-self : flex-start;
    margin : 0px 20px;
    `;

const List = styled.ScrollView`
    flex : 1;
    width : ${({ width }) => width - 40}px;
    `;

export default function App() {
    const width = useWindowDimensions().width;

    const [isReady, setIsReady] = useState(false);
    const [newTask, setNewTask] = useState('');
    const [tasks, setTasks] = useState({
        /*'1': { id: '1', text: 'Hanbit', completed: false },
        '2': { id: '2', text: 'React Native', completed: true },
        '3': { id: '3', text: 'React Native Sample', completed: false },
        '4': { id: '4', text: 'Edit TODO Item', completed: false },*/
    });

    const _saveTasks = async tasks => {
        try {
            await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
            setTasks(tasks);
        } catch (e) {
            console.error(e);
        }
    };

    const _loadTasks = async () => {
        const loadedTasks = await AsyncStorage.getItem('tasks');
        setTasks(JSON.parse(loadedTasks || '{}'));
    };

    const _addTask = () => { //추가 기능
        //alert(`Add: ${newTask}`);
        //setNewTask('');

        const ID = Date.now().toString();
        const newTaskObject = {
            [ID] : { id : ID, text : newTask, completed : false },
        };
        setNewTask('');
        _saveTasks({ ...tasks, ...newTaskObject});
    };

    const _deleteTask = id => { //삭제 기능
        const currentTasks = Object.assign({} , tasks);
        delete currentTasks[id];
        _saveTasks(currentTasks);
    };

    const _toggleTask = id => { //완료 기능
        const currentTasks = Object.assign({} , tasks);
        currentTasks[id]['completed'] = !currentTasks[id]['completed'];
        _saveTasks(currentTasks);
    };

    const _updateTask = item => { //수정 기능
        const currentTasks = Object.assign([], tasks);
        currentTasks[item.id] = item;
        _saveTasks(currentTasks);
    };

    const _handleTextChange = text => { //데이터 입력 기능
        setNewTask(text);
    };
    
    const _onBlur = () => {
        setNewTask('');
    };

    return isReady ? (
        <ThemeProvider theme={theme}>
            <Container>
                <StatusBar
                    barStyle="light-content"
                    backgroundColor="#888"
                />
                <Title>TODO List</Title>
                <Input placeholder="+ Add a Task"
                    value={newTask} //null로 원래 placeholder로 변경
                    onChangeText={_handleTextChange} //전달할 데이터 변수
                    onSubmitEditing={_addTask}  //alert 후 전달 데이터 초기화
                    onBlur={_onBlur}
                />
                <List width={width}>
                    {/*<Task text="Hanbit" />
                    <Task text="React Native" />
                    <Task text="React Native Sample" />
                    <Task text="Edit TODO Item" />*/}
                    {Object.values(tasks) //tasks를 최신 데이터 (역순)
                        .reverse()
                        .map(item => (
                            <Task 
                                key={item.id} 
                                item={item} 
                                deleteTask={_deleteTask}
                                toggleTask={_toggleTask}     
                                updateTask={_updateTask}
                            />
                        ))
                    }
                </List>
                {/*<IconButton type = {images.uncompleted} />
                <IconButton type = {images.completed} />
                <IconButton type = {images.delete} />
                <IconButton type = {images.update} /> */}
            </Container>
        </ThemeProvider>
    ) : (
        <AppLoading
        startAsync={_loadTasks} //AppLoading 컴포넌트가 동작하는 동안 실행될 함수
        onFinish={() => setIsReady(true)} //starAsync가 완료되면 실행할 함수
        onError={console.error} //startAsync에서 오류가 발생하면 실행할 함수
        />
    );
};