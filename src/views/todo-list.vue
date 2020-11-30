<template>
  <div class="todo-list">
    <h1>todos</h1>
    <div class="todo-list-content">
      <section class="content-input-box">
        <input
          class="todo-input"
          type="text"
          autofocus
          autocomplete="off"
          placeholder="What needs to be done?"
          v-model="inputValue"
          @keyup.enter="handleAddTodo($event.target)"
        />
      </section>
      <input
        v-show="todoList.length"
        type="checkbox"
        v-model="isSelectAll"
        class="toggle-all"
        :class="{'toggle-all-active': isSelectAll }"
      />
      <ul class="content" v-show="filterTodoList.length">
        <li
          class="list-item"
          @mouseenter="mouseEnter(item)"
          @mouseleave="mouseLeave(item)"
          v-for="item in filterTodoList"
          :key="item.id"
        >
          <div v-show="!item.isEdit" class="list-item-box">
            <input
              class="checkbox"
              type="checkbox"
              :checked="item.isCompleted"
              @change="handleChangeCheckbox(item)"
            />
            <div
              :class="[{ complete: item.isCompleted }, 'text']"
              @dblclick="dbClick(item)"
            >
              {{ item.content }}
            </div>
            <span
              v-show="item.isActive && !item.isEdit"
              class="delete-icon"
              @click="handleDelete(index)"
              >X</span
            >
          </div>
          <!-- 使用v-for循环时, 使用ref总会获取到的是最后的元素, 必须使用函数, 手动赋值 -->
          <input
            v-show="item.isEdit"
            class="edit-input"
            :ref="(el) => (editRefList[item.id] = el)"
            type="text"
            v-model="itemInputValue"
            @blur="handleBlur(item)"
          />
        </li>
      </ul>

      <section class="footer" v-show="todoList.length">
        <span>{{ isActiveTodos.length }} items left</span>
        <div class="status-buttons">
          <button
            :class="{ 'active-status-button': status === button }"
            v-for="(button, index) in statusButtons"
            @click="handleChange(button)"
            :key="index"
          >
            {{ button }}
          </button>
        </div>
        <p
          v-show="isCompletedTodos.length"
          class="clear-button"
          @click="handleClear"
        >
          Clear completed
        </p>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import {
  ref,
  reactive,
  computed,
  watchEffect,
  watch,
  toRefs,
  nextTick,
} from "vue";
export default {
  name: "todoList",
  setup() {
    const state = reactive({
      inputValue: "",
      todoList: [],
      itemInputValue: "",
      todoId: 0,
      currentTodoId: 0,
      status: "All",
      statusButtons: ["All", "Active", "Completed"],
    });
    // 自动获取input焦点
    // 因为在循环里，所以要定义一个ref数组，然后根据id来获取当前input的焦点
    const editRefList = ref([]);
    watchEffect(async () => {
      if (state.itemInputValue) {
        await nextTick();
        editRefList.value[state.currentTodoId].focus();
      }
    });
    //或者用watch也可以
    // watch(
    //   () => state.itemInputValue,
    //   async (val) => {
    //     if(val) {
    //     await nextTick();
    //     editRefList.value[state.currentTodoId].focus();
    //     }
    //   },
    //   {
    //     immediate: true
    //   }
    // );

    //vue3.0去除了filter过滤器，官方建议用计算属性或方法代替过滤器。
    const filterTodoList = computed(() => {
      switch (state.status) {
        case "All":
          return state.todoList;
          break;
        case "Active":
          return isActiveTodos.value;
          break;
        case "Completed":
          return isCompletedTodos.value;
          break;
      }
    });
    const isActiveTodos = computed(() =>
      state.todoList.filter((item) => !item.isCompleted)
    );
    const isCompletedTodos = computed(() =>
      state.todoList.filter((item) => item.isCompleted)
    );
    const isSelectAll = computed({
      get: () => isActiveTodos.value.length === 0 && !!state.todoList.length,
      set: (val) => {
        state.todoList.forEach((todo) => {
          todo.isCompleted = val;
        });
      },
    });
    // 添加todo
    const handleAddTodo = (e) => {
      //如果输入内容为空则立即返回
      if (e.value === "") {
        return;
      }
      state.todoList.push({
        id: state.todoId++,
        content: state.inputValue,
        isCompleted: false, //是否已完成
        isActive: false, //是否正在进行
        isEdit: false, //是否在编辑状态
      });
      state.inputValue = "";
    };
    // 删除单条
    const handleDelete = (index) => {
      state.todoList.splice(index, 1);
    };
    // 鼠标进入
    const mouseEnter = (item) => {
      item.isActive = true;
    };
    // 点击按钮改变todoList显示
    const handleChange = (status) => {
      state.status = status;
    };
    // 清空completed状态的todo
    const handleClear = () => {
      state.todoList = isActiveTodos.value;
    };
    // 鼠标移出
    const mouseLeave = (item) => {
      item.isActive = false;
    };
    // 双击item编辑
    const dbClick = (item) => {
      state.itemInputValue = item.content;
      state.currentTodoId = item.id;
      item.isEdit = true;
    };
    // 失焦事件
    const handleBlur = (item) => {
      item.content = state.itemInputValue;
      item.isEdit = false;
      state.itemInputValue = "";
    };
    // 点击checkbox切换状态
    const handleChangeCheckbox = (item) => {
      item.isCompleted = !item.isCompleted;
    };
    return {
      ...toRefs(state),
      handleAddTodo,
      handleDelete,
      handleClear,
      handleChangeCheckbox,
      mouseLeave,
      mouseEnter,
      dbClick,
      handleBlur,
      editRefList,
      isActiveTodos,
      isCompletedTodos,
      handleChange,
      filterTodoList,
      isSelectAll,
    };
  },
};
</script>
<style>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

input {
  outline: none;
}
ul,
li,
ol {
  list-style: none;
}
::-webkit-input-placeholder {
  color: #d5d5d5;
  font-size: 25px;
}
.todo-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f5f5f5;
  width: 100%;
  height: 500px;
}
h1 {
  margin: 10px;
  font-size: 100px;
  color: rgba(175, 47, 47, 0.15);
}
/* content部分样式 */
.todo-list .todo-list-content {
  position: relative;
  width: 600px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 25px 50px 0 rgba(0, 0, 0, 0.1);
}
.todo-list-content .content-input-box {
  display: flex;
  align-items: center;
  box-shadow: inset 0 -2px 1px rgba(0, 0, 0, 0.03);
}
.toggle-all {
  position: absolute;
  left: 42px;
  top: 27px;
  width: 0px;
  height: 0px;
  transform: rotate(90deg);
  cursor: pointer;
}
.toggle-all:before {
  content: "❯";
  font-size: 22px;
  color: #e6e6e6;
}
.toggle-all-active:before {
  color: #737373;
}
.todo-list-content .todo-input {
  font-size: 24px;
  width: 100%;
  padding: 16px 16px 16px 60px;
  border: 1px solid transparent;
  background: rgba(0, 0, 0, 0.003);
}
.content .list-item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 24px;
  border-bottom: 1px solid #ececec;
}
.list-item .edit-input {
  width: 100%;
  padding: 16px;
  margin-left: 42px;
  font-size: 24px;
  box-shadow: inset 0 -1px 5px 0 rgba(0, 0, 0, 0.2);
  border: 1px solid #999;
}
.list-item .list-item-box {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  padding: 16px;
}
.list-item .checkbox {
  cursor: pointer;
  width: 20px;
  height: 20px;
}
.list-item .text {
  margin-left: 30px;
  width: 100%;
  text-align: left;
}
.list-item .delete-icon {
  color: red;
  cursor: pointer;
}
.complete {
  color: #d9d9d9;
  text-decoration: line-through;
}
/* footer部分样式 */
.footer {
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
}
.footer .status-buttons {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.footer .status-buttons button {
  padding: 2px 8px;
  margin-left: 5px;
}
.footer .clear-button {
  cursor: pointer;
}
.active-status-button {
  background-color: #777;
  outline: -webkit-focus-ring-color auto 1px;
}
</style>