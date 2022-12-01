import "./App.css";
import { useState, useEffect } from "react";
import ReactLoading from "react-loading";
import axios from "axios";
import Modal from "react-modal";
import BarChart from "react-easy-bar-chart";
import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";

function PokeDex() {
  const [pokemons, setPokemons] = useState([]);
  const [pokemonsFiltered, setPokemonsFiltered] = useState([]);
  const [pokemonDetail, setPokemonDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [prevApi, setPrevApi] = useState("");
  const [nextApi, setNextApi] = useState("");
  const [apiUrl, setApiUrl] = useState("https://pokeapi.co/api/v2/pokemon");

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      background: "black",
      color: "white",
    },
    overlay: { backgroundColor: "grey" },
  };

  useEffect(() => {
    setIsLoading(true);
    fetchPokeDex();
  }, [apiUrl]);

  function fetchPokeDex() {
    axios
      .get(apiUrl)
      .then((res) => {
        const { results, next, previous } = res.data;
        setPokemons(results);
        setPokemonsFiltered(results);
        setPrevApi(previous);
        setNextApi(next);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  }

  function openModal(val) {
    axios
      .get(val.url)
      .then((res) => {
        console.log({ res });
        setPokemonDetail(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function searchPokemon(val) {
    setSearch(val);
  }

  function resolveDataToBarChart(datas) {
    return datas.map((val) => ({
      title: val.stat.name,
      value: val.base_stat,
      color: "blue",
    }));
  }

  useEffect(() => {
    let result = pokemons;
    console.log({ search });
    if (!!search) {
      axios
        .get("https://pokeapi.co/api/v2/pokemon?offset=0&limit=1000000")
        .then((res) => {
          const { results, next, previous } = res.data;
          if (!next && !previous) {
            result = results.filter((pokemon) => {
              return pokemon.name.includes(search);
            });
            setPokemonsFiltered(result);
          }
        });
    } else if (!search) {
      console.log("go here");
      setIsLoading(true);
      fetchPokeDex();
    }
  }, [search]);

  const handleEmptyField = (event) => {
    if (!event.target.value) setSearch("");
  };

  async function printDocument() {
    const input = document.getElementById("divToPrint");
    const dataUrl = await htmlToImage.toPng(input);
    const pdf = new jsPDF();
    pdf.setFillColor(204,204,204,0);
    pdf.rect(0,0,200,200, 'F');
    pdf.addImage(dataUrl, "png", 0, 0);
    pdf.save("PokeMonDetail.pdf");
  }

  function sortPokemons() {
    let results = [];
    if (["", "DESC"].includes(sort)) {
      results = [...pokemonsFiltered].sort((a, b) =>
        a.name > b.name ? 1 : -1
      );
      setSort("ASC");
    } else {
      results = [...pokemonsFiltered].sort((a, b) =>
        a.name < b.name ? 1 : -1
      );
      setSort("DESC");
    }
    setPokemonsFiltered(results);
  }

  function prev() {
    setApiUrl(prevApi);
  }

  function next() {
    setApiUrl(nextApi);
  }

  if (!isLoading && pokemons && pokemons.length === 0) {
    return (
      <div>
        <header className="App-header">
          <h1>Welcome to pokedex !</h1>
          <h2>Requirement:</h2>
          <ul>
            <li>
              Call this api:https://pokeapi.co/api/v2/pokemon to get pokedex,
              and show a list of pokemon name.
            </li>
            <li>Implement React Loading and show it during API call</li>
            <li>
              when hover on the list item , change the item color to yellow.
            </li>
            <li>when clicked the list item, show the modal below</li>
            <li>
              Add a search bar on top of the bar for searching, search will run
              on keyup event
            </li>
            <li>Implement sorting and pagingation</li>
            <li>Commit your codes after done</li>
            <li>
              If you do more than expected (E.g redesign the page / create a
              chat feature at the bottom right). it would be good.
            </li>
          </ul>
        </header>
      </div>
    );
  }

  return (
    <div>
      <header className="App-header">
        {isLoading ? (
          <>
            <div className="App">
              <header className="App-header">
                <ReactLoading
                  type={"balls"}
                  color={"#3d3d3d"}
                  height={667}
                  width={375}
                />
              </header>
            </div>
          </>
        ) : (
          <>
            <h1>Welcome to pokedex !</h1>
            <input
              type="search"
              name="search"
              defaultValue=""
              onKeyUp={(val) => searchPokemon(val.target.value)}
              onChange={handleEmptyField}
            ></input>
            <button onClick={() => sortPokemons()}>Sort</button>
            {pokemonsFiltered &&
              pokemonsFiltered.map((val, idx) => (
                <div
                  key={idx}
                  className="PokeList"
                  onClick={() => openModal(val)}
                >
                  {val.name}
                </div>
              ))}
            <button onClick={() => prev()} disabled={!prevApi}>
              Prev
            </button>
            <button onClick={() => next()} disabled={!nextApi}>
              Next
            </button>
          </>
        )}
      </header>
      {pokemonDetail && (
        <Modal
          isOpen={!!pokemonDetail}
          contentLabel={pokemonDetail?.name || ""}
          onRequestClose={() => {
            setPokemonDetail(null);
          }}
          style={customStyles}
        >
          {/* <div>
            Requirement:
            <ul>
              <li>show the sprites front_default as the pokemon image</li>
              <li>
                Show the stats details - only stat.name and base_stat is
                required in tabular format
              </li>
              <li>Create a bar chart based on the stats above</li>
              <li>
                Create a buttton to download the information generated in this
                modal as pdf. (images and chart must be included)
              </li>
            </ul>
          </div> */}
          <div
            id="divToPrint"
          >
            <img
              src={pokemonDetail.sprites.front_default}
              alt="the sprite"
            ></img>
            <span>Stats Details</span>
            <ul>
              {pokemonDetail &&
                pokemonDetail.stats &&
                pokemonDetail.stats.map((valStat, idx) => (
                  <li key={idx}>
                    Base Stat : {valStat.base_stat}
                    <br></br>
                    Stat Name : {valStat.stat.name}
                  </li>
                ))}
            </ul>
            <BarChart
              xAxis="stats"
              yAxis="values"
              height={400}
              width={800}
              data={resolveDataToBarChart(pokemonDetail.stats)}
            />
          </div>
          <button onClick={() => printDocument()} style={{ cursor: "pointer" }}>
            Download as PDF
          </button>
        </Modal>
      )}
    </div>
  );
}

export default PokeDex;
