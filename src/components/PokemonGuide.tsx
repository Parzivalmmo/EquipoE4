import { useState, useEffect, useRef } from "react" // Se añadió useRef
import { ChevronDown, ChevronUp } from "lucide-react"

// Import interfaces
import type { Pokemon } from "../interfaces/Pokemon"
import type { Region } from "../interfaces/Region"

// Import hooks
import { useDynamicImports } from "../hooks/useDynamicImports"

// Import components
import { RegionCard } from "./RegionCard"
import { LeaderCard } from "./LeaderCard"
import { PokemonCard } from "./PokemonCard"
import { PokemonDetails } from "./PokemonDetails"

export default function PokemonGuide() {
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null)
  const [expandedLeader, setExpandedLeader] = useState<string | null>(null)
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null)
  const [lightMode, setLightMode] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const [regions, setRegions] = useState<Region[]>([])
  const [regionsLoaded, setRegionsLoaded] = useState(false)
  const [loading, setLoading] = useState(true)

  // Referencia para el scroll automático
  const detailsRef = useRef<HTMLDivElement>(null)

  const { getPokemonFiles } = useDynamicImports()

  // Load region config
  useEffect(() => {
    const loadRegionConfig = async () => {
      try {
        const regionConfigModule = await import("../data/config-region.json")
        setRegions(regionConfigModule.regions || [])
      } catch (error) {
        console.error("Error loading region config:", error)
      }
    }

    loadRegionConfig()
  }, [])

  // Load pokemon data (FIXED)
  useEffect(() => {
    const loadPokemonData = async () => {
      if (regions.length === 0 || regionsLoaded) return

      const updatedRegions: Region[] = []

      for (const region of regions) {
        const updatedLeaders = []

        for (const leader of region.leaders) {
          try {
            const pokemonFiles = await getPokemonFiles(region.id, leader.id)

            const pokemons = await Promise.all(
              pokemonFiles.map(async (file) => {
                try {
                  const module = await import(
                    `../data/${region.id}/${leader.id}/${file.replace(".json", "")}.json`
                  )

                  const data = module.default || module

                  return {
                    ...data,
                    id:
                      data.id ||
                      data.name?.toLowerCase() ||
                      file.replace(".json", ""),
                  }
                } catch (error) {
                  console.error(`Error importing ${file}:`, error)
                  return null
                }
              })
            )

            updatedLeaders.push({
              ...leader,
              pokemons: pokemons.filter(Boolean),
            })
          } catch (error) {
            console.error(
              `Error loading pokemon data for ${leader.name}:`,
              error
            )

            updatedLeaders.push({
              ...leader,
              pokemons: [],
            })
          }
        }

        updatedRegions.push({
          ...region,
          leaders: updatedLeaders,
        })
      }

      setRegions(updatedRegions)
      setRegionsLoaded(true)
      setLoading(false)
    }

    loadPokemonData()
  }, [regions, regionsLoaded, getPokemonFiles])

  const handleRegionClick = (regionId: string) => {
    if (expandedRegion === regionId) {
      setExpandedRegion(null)
      setExpandedLeader(null)
      setSelectedPokemon(null)
    } else {
      setExpandedRegion(regionId)
      setExpandedLeader(null)
      setSelectedPokemon(null)
    }
  }

  const handleLeaderClick = (leaderId: string) => {
    if (expandedLeader === leaderId) {
      setExpandedLeader(null)
      setSelectedPokemon(null)
    } else {
      setExpandedLeader(leaderId)
      setSelectedPokemon(null)
    }
  }

  const handlePokemonClick = (pokemon: Pokemon) => {
    const isSame = selectedPokemon?.name === pokemon.name;
    setSelectedPokemon(isSame ? null : pokemon);

    // Si se está seleccionando uno nuevo, hacemos scroll
    if (!isSame) {
      setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }

  const currentRegion = regions.find((r) => r.id === expandedRegion)

  const currentLeader = currentRegion?.leaders.find(
    (l) => l.id === expandedLeader
  )

  const currentLeaderPokemons = currentLeader?.pokemons || []

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        lightMode
          ? "bg-gray-100 text-gray-900"
          : "bg-[#111827] text-white"
      }`}
    >
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            FARM LIGA PokeMMO
          </h1>

          <p className="text-blue-400 font-bold mb-4">
            <a
              href="https://youtu.be/LidSI0vJYKs?si=JRz1Vgg_1OzLFPDI"
              target="_blank"
              rel="noreferrer"
            >
              <span className="inline-flex items-center hover:text-red-600 transition-colors">
                <img
                  className="w-8 h-8"
                  src={`${import.meta.env.BASE_URL}images/PaxpoYT.png`}
                  alt="Guía en Video"
                />
                <span className="pl-2">
                  VER TUTORIAL EN VIDEO
                </span>
              </span>
            </a>

            <span className="mx-2">|</span>

            <a
              href="https://discord.gg/pKPxjAFNmA"
              target="_blank"
              rel="noreferrer"
            >
              <span className="inline-flex items-center hover:text-white-600 transition-colors">
                <img
                  className="w-6 h-6"
                  src={`${import.meta.env.BASE_URL}images/discord.png`}
                  alt="Reportes"
                />
                <span className="pl-2">Reportes</span>
              </span>
            </a>
          </p>

          <p className="text-gray-400 mb-4">
            RUTA RECOMENDADA:
            <span className="pl-2 text-blue-400 flex flex-wrap items-center gap-2 justify-center">
              Teselia →
              <span className="inline-flex items-center gap-1">
                Sinnoh (casa)
                <img
                  className="w-4 h-4"
                  src={`${import.meta.env.BASE_URL}images/Healicon.png`}
                  alt="Casa"
                />
              </span>
              →
              <span className="inline-flex items-center gap-1">
                Hoenn (casa)
                <img
                  className="w-4 h-4"
                  src={`${import.meta.env.BASE_URL}images/Healicon.png`}
                  alt="Casa"
                />
              </span>
              →
              Johto →
              <span className="inline-flex items-center gap-1">
                Kanto (casa)
                <img
                  className="w-4 h-4"
                  src={`${import.meta.env.BASE_URL}images/Healicon.png`}
                  alt="Casa"
                />
              </span>
            </span>
          </p>

          {loading && (
            <p className="text-yellow-400 font-semibold">
              Cargando datos...
            </p>
          )}
        </div>

        {/* Tips */}
        <div className="flex flex-col items-center mb-2">
          <button
            onClick={() => setShowTips(!showTips)}
            className="flex gap-2 hover:text-blue-300 transition-colors"
          >
            {showTips ? (
              <ChevronUp className="w-4 h-4 text-blue-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-blue-400" />
            )}

            <span className="text-yellow-400 font-medium pb-2">
              RECOMENDACIONES ANTES DE EMPEZAR <b>(EQUIPO - TIPS)</b>
            </span>
          </button>

          {showTips && (
            <ul className="list-disc text-left max-w-2xl mx-auto pl-6 text-gray-300">
              <li>
                EQUIPO NECESARIO:{" "}
                <a
                  href="https://pdftourl.net/images/1791652235937-c711d66c-ff37-457c-973d-873711323734.webp"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400"
                >
                  👉 Hacer Click Aqui 👈
                </a>
              </li>
              <li>Aqui Farmeo en Stream 👉 https://www.twitch.tv/parzivalmmo</li>
              <li>Completa cada Liga 5 veces antes.</li>
              <li>Recuerda Que Otra Vez Sirve Para Bostearte 2 Veces Cuando se acaba usalo otra vez,si te hace falta bostearte mas.</li>
              <li>Desactivar EXP Share/Reamplificador.</li>
              <li>Compra 20 Ataque x , Velocidad x ,Especial x , Precisión x Y 5 Defensa X y Defensa Especial X    .</li>
              <li>Recuerda que el primer numero es maquinacion o especial x.</li>
              <li>Y el segundo numero es Velocidad</li>
              <li>Utilizar "Otra Vez" con Gengar salvo indicación.</li>
              <li>Reportar errores en Discord.</li>
            </ul>
          )}
        </div>

        {/* Regions */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {regions.map((region) => (
            <RegionCard
              key={region.id}
              region={region}
              isExpanded={expandedRegion === region.id}
              onClick={handleRegionClick}
            />
          ))}
        </div>

        {/* Leaders */}
        {expandedRegion && currentRegion && (
          <div className="grid grid-cols-5 gap-3 mb-6">
            {currentRegion.leaders.map((leader) => (
              <LeaderCard
                key={leader.id}
                leader={leader}
                isExpanded={expandedLeader === leader.id}
                onClick={handleLeaderClick}
              />
            ))}
          </div>
        )}

        {/* Pokemon */}
        {expandedLeader && (
          <div className="mb-6">
            <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
              {currentLeaderPokemons.map((pokemon) => (
                <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  isSelected={selectedPokemon?.id === pokemon.id}
                  onClick={handlePokemonClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* Details - Se añadió el ref y scroll-margin para mejor visualización */}
        {selectedPokemon && (
          <div ref={detailsRef} className="scroll-mt-10">
            <PokemonDetails pokemon={selectedPokemon} />
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between mt-8 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-gray-400">Creditos</span>

            <img
              src={`${import.meta.env.BASE_URL}images/LehosifJS.png`}
              className="w-12 h-12"
              alt="Lehosif"
            />

            <div className="flex items-center gap-2">
              <a href="https://imgur.com/IgDjlXj" target="_blank" rel="noreferrer">
                <img className="w-10 h-10 hover:scale-110 transition-transform"
                  src={`${import.meta.env.BASE_URL}images/IrviingHC.png`} alt="Irviing" />
              </a>

              <a href="https://imgur.com/Hxui6yL" target="_blank" rel="noreferrer">
                <img className="w-10 h-10 hover:scale-110 transition-transform"
                  src={`${import.meta.env.BASE_URL}images/zParzival.png`} alt="Parzival" />
              </a>

              <a href="https://imgur.com/JRVJmKe" target="_blank" rel="noreferrer">
                <img className="w-10 h-10 hover:scale-110 transition-transform"
                  src={`${import.meta.env.BASE_URL}images/ItachiiSuka.png`} alt="Itachii" />
              </a>
            </div>
          </div>

          <button
            onClick={() => setLightMode(!lightMode)}
            className="text-gray-400 hover:text-white"
          >
            {lightMode ? "Dark Mode" : "Light Mode"}
          </button>
        </div>

      </div>
    </div>
  )
}
