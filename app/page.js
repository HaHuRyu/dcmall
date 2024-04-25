import {id, password} from "./login"

export default function Home() {
  return (
    <div>
      <h4>이정희 꺼임</h4>
      <h4>dcmall</h4>

      <form action="/api/post/login" method = "POST">
        <input type="text" placeholder="ID" name="id" />
        <input type="password" placeholder="PW" name="password" />
        <button type="submit">login</button>
      </form>
    </div>
  );
}
