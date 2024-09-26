export default function Page() {
  const [loginSession, setLoginSession] = useState(initialSession);
  const [searchWord, setSearchWord] = useState('');
  const [resultList, setResultList] = useState([]);

  const searchSubmit = async (e) => {
    e.preventDefault(); //아랫코드가 다 실행되고 나서 새로고침되는 것을 막는다
    try{
      const response = await fetch('/api/post/embedding', {
        method: 'POST',
        headers: {
          'Content-Type' : 'application/json'
        },
        body: JSON.stringify({
          searchText: searchWord
        })
      });


      const data = await response.json();
      const recommandList = data.recommendations;

      console.log("test"  + data.aaa);

      if(response.status === 200){
        console.log(recommandList.length)
        setResultList(recommandList);
      }else{
        alert("오류");
      }
      
    }catch(error){
      console.log("search fetch Error: "+error);
    }
  };

  useEffect(() => {
    setLoginSession(initialSession);
  }, [initialSession]);

  const hadleBlur = async(e) => {
    try{
      e.preventDefault();
      const response = await fetch('/api/post/searchRecommand', {
          method: 'POST',
          headers: {
            'Content-Type' : 'application/json'
          },
          body: JSON.stringify({
            searchText: searchWord
          })
      });

      const data = await response.json();

      if(data.status === 200){
        console.log("검색어 추천 성공!: "+data.message);
      }else{
        console.log("검색어 추천 실패!");
      }
    }catch(err){
      console.log("검색어 추천 캐치"+err);
    }
  }

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const response = await fetch('/api/post/logOut', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userSession: loginSession,
        }),
      });

      if (response.status === 200) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error("로그아웃 오류!", error);
    }
  };
  return (
    <div>
      <h1>Welcome to Dcmall</h1>
      {resultList.length > 0 ? (
        <ul>
          {resultList.map((result, index) => (
            <li key={index}>
              {result.title}: {Number(result.similarity * 100).toFixed(2)}%
            </li>
          ))}
        </ul>
      ) : (
        <p>검색 결과가 없습니다.</p>
      )}
    </div>
  );
}