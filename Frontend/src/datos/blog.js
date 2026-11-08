// blog.js — artículos del blog y episodios del podcast de /blog,
// editables desde /admin/blog.
//
// SUSTITUTO PROVISIONAL DE LA BASE DE DATOS (igual que datos/landing.js):
// la web lo lee a través de lib/blog.js y el admin parte de aquí.
// Migrado tal cual desde el antiguo app/[locale]/blog/blog.js (los
// párrafos seguidos se juntaron en un bloque "texto"). Ver docs/ADMIN.md.
// Textos siempre { es, en }. Un texto opcional vacío ("") no se pinta.
//
// ARTICULOS (el listado los ordena por fecha, del más reciente al más antiguo)
//   slug            su dirección: /blog/<slug>. No cambia una vez publicado.
//   publicado       false = oculto: no sale en el listado y su URL lleva al blog.
//   fecha           "AAAA-MM-DD", sale bajo el título y en la tarjeta.
//   imagenCubierta  foto de la cabecera y de la tarjeta del listado.
//   titulo, resumen el resumen sale en la tarjeta y en Google.
//   bloques         el cuerpo, en orden. Cada bloque lleva un "id" fijo y un "tipo":
//     texto      texto { es: [párrafos], en: [párrafos] } (se respetan los
//                saltos de línea y los espacios dentro de cada párrafo).
//     subtitulo  texto { es, en }.
//     foto       src, pie { es, en } (opcional) y alt (descripción para
//                Google y lectores de pantalla; si falta, se usa el pie).
//     fotos      fotos [{ src, pie, alt }]: de 2 a 4, una al lado de otra.
//     cita       texto { es, en } y autor { es, en } (opcional).
//
// EPISODIOS (en el orden del listado). Sin página propia: la tarjeta
// lleva al vídeo.
//   slug, publicado, titulo, enlace (YouTube), imagenCubierta,
//   duracion (texto libre: "34 min").

export const ARTICULOS = [
  {
    "slug": "la-nina-de-la-aguja",
    "publicado": true,
    "fecha": "2024-04-21",
    "imagenCubierta": "/media/web/img/blog/20-la-nina-de-la-aguja/fely-campo-blog-la-nina-de-la-aguja-portada.webp",
    "titulo": {
      "es": "La Niña de la Aguja",
      "en": "The Girl with the Needle"
    },
    "resumen": {
      "es": "Un cuento de Bozhana Stoeva basado en la historia real de Fely Campo: de una niña de trece años con un dedal en Salamanca a más de 50 años dedicada a la alta costura.",
      "en": "A story by Bozhana Stoeva based on the real life of Fely Campo: from a thirteen-year-old girl with a thimble in Salamanca to more than 50 years devoted to haute couture."
    },
    "bloques": [
      {
        "id": "b1",
        "tipo": "texto",
        "texto": {
          "es": [
            "Cuento basado en la historia de Fely Campo, escrito por Bozhana Stoeva (Lo Invisible Visible blog).",
            "Amanecía. La ciudad de Salamanca todavía dormía. El crepúsculo se disipaba por las silenciosas calles. El eco de los pasos retumbaba por las baldosas que servían de vestimenta de las angostas travesías. Las pocas luces se asomaban por las ventanas de los edificios cuyos destellos se perseguían por la piedra franca que cubría las fachadas de los eternos palacetes solariegos. Detrás de una abertura se divisaba el rostro de una niña de profundos ojos oscuros. Se solía despertar temprano. Mientras los demás dormían disfrutaba del amanecer y de la intimidad que las primeras horas de la mañana le otorgaban en exclusiva a ella. Deambulaba por los vericuetos de sus sueños, trazaba el recorrido del futuro.",
            "Tenía deseos simples, reales, humanos. Se imponía metas a largo plazo. Enumeraba los objetivos que parecían lejos del alcance. Sin haber leído las obras de Nicolás Maquiavelo era consciente de que las metas deberían proyectarse más allá de lo posible para alcanzar lo añorado. \"Sólo apuntando lejos, el objetivo se consigue\", se decía la niña a sí misma.",
            "Pronto su madre se levantaría y la sacaría del ensimismamiento. La desviaría del viaje por el país de los sueños. Le daría las tareas del día. Hasta la madrugada siguiente no volvería a la ventana a través de la cual se abría el amplio horizonte de un ahora y de un hoy, de un mañana y de un después.",
            "La niña escuchó la voz de su madre desde un rincón de la casa. Era la hora de los quehaceres que le asignaban. Aún con algo de sueño se dirigió adónde la reclamaban. Tenía un mal presentimiento. Para animarse, optó por pensar en el paseo que daría más tarde por la ciudad. Escucharía el sonido de los pasos resonando por las grandes piedras francas de las rúas. Perseguiría las sombras que la luz diurna perfilaba por las fachadas de las casas señoriales. De camino a la Plaza Mayor, se detendría un instante en frente de la Casa de las Conchas. Se quedaría como si contase las conchas incrustadas investigando la técnica con la cual las manos de los albañiles las eternizaron y regalaron a la humanidad. Retomaría la ruta. Pasaría despreocupada por la calle de Padilleros desde donde continuaría otro recorrido allende las fronteras de Salamanca y las callejuelas por las cuales se perdía. Volvería al juego de la adivinanza en un intento de enumerar los nombres cambiantes de la calle de los mil nombres. Llegaría a la Plaza Mayor. Observaría como si la viese por primera vez la arquitectura singular. No era un cuadrado perfecto. Ninguna de sus fachadas medía lo mismo. Se esforzaría en entender la descripción que Miguel de Unamuno le había dado."
          ],
          "en": [
            "A story based on the life of Fely Campo, written by Bozhana Stoeva (Lo Invisible Visible blog).",
            "Dawn was breaking. The city of Salamanca still slept. The half-light dissolved through the silent streets. The echo of footsteps rang off the paving stones that dressed the narrow lanes. The few lit windows peered out from buildings whose glow chased itself across the pale stone that clad the façades of the eternal ancestral mansions. Behind one such opening, the face of a girl with deep, dark eyes could be made out. She was in the habit of waking early. While everyone else slept, she savoured the dawn and the privacy that those first hours of the morning granted her alone. She wandered the twists and turns of her dreams, tracing the path of the future.",
            "Her wishes were simple, real, human. She set herself long-term goals. She listed objectives that seemed far beyond reach. Without ever having read the works of Niccolò Machiavelli, she knew that a goal had to be aimed further than what seemed possible in order to reach what was truly longed for. \"Only by aiming far does one reach the target,\" the girl told herself.",
            "Soon her mother would get up and pull her out of her reverie. She would divert her from her journey through the land of dreams. She would hand her the day's chores. Not until the following dawn would she return to the window through which opened the wide horizon of a now and a today, of a tomorrow and an after.",
            "The girl heard her mother's voice from a corner of the house. It was time for the chores assigned to her. Still a little drowsy, she made her way to where she was wanted. She had a bad feeling. To lift her spirits, she chose to think about the walk she would take through the city later. She would listen to the sound of footsteps echoing off the great pale stones of the old streets. She would chase the shadows the daylight traced along the façades of the noble houses. On the way to the Plaza Mayor, she would pause a moment in front of the Casa de las Conchas. She would linger there as if counting the shells set into its walls, wondering at the skill with which the masons' hands had made them eternal and given them to humanity. She would take up the route again. She would pass carefree along Calle Padilleros, from where she'd wander further still, beyond the edges of Salamanca and the little streets in which she liked to lose herself. She would go back to her guessing game, trying to list the ever-changing names of the street of a thousand names. She would reach the Plaza Mayor. She would look, as if seeing it for the first time, at its singular architecture. It wasn't a perfect square. No two of its façades measured the same. She would try hard to understand the description Miguel de Unamuno had once given of it."
          ]
        }
      },
      {
        "id": "b2",
        "tipo": "cita",
        "texto": {
          "es": "¿Es un cuadrilátero. Irregular, pero asombrosamente armónico. ¿Qué sería esto?, se haría la pregunta sin esperar una respuesta.",
          "en": "\"It's a quadrilateral. Irregular, yet astonishingly harmonious. What could this be?\" she would ask herself, without waiting for an answer."
        },
        "autor": {
          "es": "",
          "en": ""
        }
      },
      {
        "id": "b3",
        "tipo": "texto",
        "texto": {
          "es": [
            "\"Algo útil debes de aprender\", la niña escuchó la orden. \"Si no se estudia, se ha de dominar un oficio\", le introdujo el dedo en el dedal y le puso la aguja en la mano."
          ],
          "en": [
            "\"You need to learn something useful,\" the girl heard the order. \"If you won't study, you must master a trade\" — and her mother slid the thimble onto her finger and placed the needle in her hand."
          ]
        }
      },
      {
        "id": "b4",
        "tipo": "foto",
        "src": "/media/web/img/blog/20-la-nina-de-la-aguja/fely-campo-blog-la-nina-de-la-aguja-detalle-atelier.webp",
        "alt": "Detalle de una aguja de máquina de coser sobre una etiqueta Fely Campo",
        "pie": {
          "es": "La aguja y el dedal.",
          "en": "The needle and the thimble."
        }
      },
      {
        "id": "b5",
        "tipo": "texto",
        "texto": {
          "es": [
            "La niña se asustó. El castigo le pareció fuerte. Clavó los profundos ojos oscuros en los ojos de su madre. No percibió ningún indicio de misericordia, ni benevolencia. La madre se mantuvo firme en la decisión tomada. La niña había cumplido trece años. No le consentiría que destrozase su futuro. Si no quería estudiar, debería dominar un oficio.",
            "La niña conocía a su madre. Una mujer con clase y estilo que venía de Valero. Había heredado la determinación de la gente que procedía de la Sierra de Francia. Cuando tomaba una decisión era inquebrantable. No cedería a las súplicas de la niña, no le consentiría incumplir la orden. Fue duro. El dedal se deslizaba. Se perdía entre la manita fina de aquella niña delgadita y delicada. Inclinada sobre la tela con la aguja de coser, asemejaba una muñeca de Lladró con pelo oscuro y ojos grandes como dos aceitunas. No hubo una alternativa. Obedeció al dolor de la aguja, a los callos que le provocaba el dedal. Día tras días repetía los intentos de coser las telas y ajustarse a los patrones que su madre le pasaba. No funcionaba. La madre observaba. Examinaba. No aprobaba.",
            "Hasta que un día la niña se emocionó. Vio aquello en lo que no había reparado. El enfado no impedía percibir lo visible invisible entre las telas y los pinchazos de la aguja. Daría riendas sueltas a la imaginación. La creatividad la guiaría por los desvíos del destino. Haría sola lo que tanto deseaba para sentirse segura. Se diseñaría un bonito vestido a medida. Consciente de lo tímida que era escondería la timidez con aquello que ella misma se cosería."
          ],
          "en": [
            "The girl was frightened. The punishment felt harsh to her. She fixed her deep, dark eyes on her mother's. She saw no trace of mercy there, nor kindness. Her mother held firm to the decision she'd made. The girl had just turned thirteen. She would not allow her to ruin her future. If she didn't want to study, she would have to master a trade.",
            "The girl knew her mother well. A woman of class and style who came from Valero. She had inherited the resolve of people from the Sierra de Francia. Once she made a decision, it was unshakeable. She would not give in to the girl's pleading, nor allow her to disobey the order. It was hard. The thimble kept slipping. It got lost on the small, thin hand of that slight, delicate girl. Bent over the fabric with her sewing needle, she looked like a Lladró doll, with dark hair and eyes as large as two olives. There was no alternative. She obeyed the sting of the needle, the calluses the thimble raised on her finger. Day after day she tried again to sew the fabric and follow the patterns her mother gave her. It didn't work. Her mother watched. She examined. She did not approve.",
            "Until one day the girl felt something stir in her. She saw what she hadn't noticed before. Her frustration hadn't kept her from sensing the invisible made visible between the fabric and the pricks of the needle. She would give free rein to her imagination. Creativity would guide her along destiny's detours. She would make, on her own, what she so wanted, to feel safe. She would design herself a beautiful, made-to-measure dress. Aware of how shy she was, she would hide that shyness inside whatever she sewed for herself."
          ]
        }
      },
      {
        "id": "b6",
        "tipo": "cita",
        "texto": {
          "es": "Manos a la obra. Al menos Mamá no se enfadará con mis malas notas en el cole, pensó la niña.",
          "en": "\"Let's get to work. At least Mum won't be angry about my bad grades at school,\" the girl thought."
        },
        "autor": {
          "es": "",
          "en": ""
        }
      },
      {
        "id": "b7",
        "tipo": "texto",
        "texto": {
          "es": [
            "La ventaja sería el propio estilo. Se elaboraría la ropa. Se vestiría con la elegancia de las actrices de las películas. No se sentiría rara.",
            "La obligación se convirtió en pasión. La pasión en una dedicación. Se entregó en cuerpo y alma a la aguja y al dedal.",
            "La madre la vigilaba, a veces desde la cercanía, a veces desde la lejanía. Dejaba el espacio a la niña.",
            "La niña aprendía sola el oficio de modista. La costura era un mundo aparte. Según crecía descubría las peripecias del oficio y del entorno. Ser mujer emprendedora resultaba más que un desafío. Comenzaba a comprender mejor la dureza del carácter de su madre. Se levantaba antes del amanecer. Diseñaba, dibujaba, hacía a medida los vestidos y las prendas de las clientas. A mediodía se ocupaba del negocio. Buscaba las telas. Lidiaba con vendedores. Imponía autoridad ante la falta de respeto masculino. Se enfrentada a la desconfianza en áreas diversas. Continuó adelante fiel a las primeras clientas, las señoras de su querida Salamanca."
          ],
          "en": [
            "The advantage would be a style all her own. She would make her own clothes. She would dress with the elegance of actresses in the films. She wouldn't feel strange anymore.",
            "Obligation turned into passion. Passion turned into devotion. She gave herself, body and soul, to the needle and the thimble.",
            "Her mother watched over her, sometimes up close, sometimes from a distance. She gave the girl her space.",
            "The girl taught herself the dressmaker's trade. Sewing was a world of its own. As she grew, she discovered the trade's twists and turns, and the world around it. Being a woman starting a business turned out to be more than a challenge. She began to understand the harshness of her mother's character a little better. She rose before dawn. She designed, she drew, she made her clients' dresses and garments to measure. At midday she took care of the business. She sought out fabrics. She dealt with sellers. She asserted her authority in the face of men's lack of respect. She faced distrust in all kinds of areas. She kept going, faithful to her first clients, the ladies of her beloved Salamanca."
          ]
        }
      },
      {
        "id": "b8",
        "tipo": "foto",
        "src": "/media/web/img/blog/20-la-nina-de-la-aguja/fely-campo-blog-la-nina-de-la-aguja-felycampoblog-blogdemoda-1.webp",
        "alt": "Una mano dibuja el boceto de una prenda sobre un cristal",
        "pie": {
          "es": "Diseñaba, dibujaba, hacía a medida.",
          "en": "She designed, she drew, she made to measure."
        }
      },
      {
        "id": "b9",
        "tipo": "texto",
        "texto": {
          "es": [
            "La niña trabajaba con empeño. Las clientas fieles traían a otras clientas. El negocio se expandía. La fama de la niña llegó a toda la Provincia de Salamanca. Señoras nobles, ricas y no tan ricas deseaban conocer a la Niña de la Aguja. Ávidas de tener un diseño exclusivo, de lucir vestidos irrepetibles en las fiestas o en una boda, pedían citas con antelación. Se enojaban cuando no lo conseguían.",
            "La Niña de la Aguja no rechazaba a ninguna mujer que le acercaba al taller. Apreciaba el aprecio. Valoraba el valor de la confianza.",
            "Cuando se cansaba o la inspiración se demoraba, la Niña de la Aguja se dirigía a la Plaza Mayor de Salamanca. Daba vueltas entre las fachadas irregulares. Se inspiraba en la armonía del cuadrilátero irregular, pero asombrosamente armónico. La compañía de los desconocidos que se acercaban a la plaza la hacía relajarse. La creatividad rebrotaba.",
            "La Niña de la Aguja volvía al taller. Cogía con ansiedad el lápiz. Los dedos comenzaban a dibujar hasta que no consiguieran lo que esbozaba la imaginación."
          ],
          "en": [
            "The girl worked doggedly. Loyal clients brought other clients. The business grew. Word of the girl reached the whole province of Salamanca. Noble ladies, rich and not-so-rich, wanted to meet the Needle Girl. Eager for an exclusive design, to wear an unrepeatable dress to a party or a wedding, they asked for appointments well in advance. They grew annoyed when they couldn't get one.",
            "The Needle Girl never turned away a single woman who came to her workshop. She valued being valued. She treasured the worth of trust.",
            "When she grew tired, or inspiration was slow to come, the Needle Girl would walk to Salamanca's Plaza Mayor. She would circle among its irregular façades. She drew inspiration from the harmony of that irregular, yet astonishingly harmonious, quadrilateral. The company of strangers who came to the square helped her relax. Her creativity would bloom again.",
            "The Needle Girl would return to the workshop. She would seize the pencil, restless. Her fingers would begin to draw, until they achieved what her imagination had sketched."
          ]
        }
      },
      {
        "id": "b10",
        "tipo": "foto",
        "src": "/media/web/img/blog/20-la-nina-de-la-aguja/fely-campo-blog-la-nina-de-la-aguja-atelierfiesta-atelierfiestasalamanca-21.webp",
        "alt": "Fachada del atelier Fely Campo en Salamanca",
        "pie": {
          "es": "El local de Salamanca.",
          "en": "The shop in Salamanca."
        }
      },
      {
        "id": "b11",
        "tipo": "texto",
        "texto": {
          "es": [
            "Un día, después de haber paseado por el lugar de su inspiración, la Plaza Mayor de su querida Salamanca, se encaminó a casa. Bajando por la calle de Padilleros vislumbró un cartel. Se alquilaba un local. Eran las 9.00 horas de la mañana. A las 11.00 horas lo tenía alquilado. Dio el primer paso para salir de la ciudad natal y la Provincia de Salamanca. Llegó a Barcelona. Cruzó las fronteras de España. Alcanzó el reconocimiento en París, Milán y Londres. Conocía el éxito. Abrió tiendas en las famosas ciudades de la moda. Y cuando había recorrido caminos, encontró el lugar idóneo para estar en la capital de su país natal. Coincidencia o no, la esperaba en el madrileño barrio de Salamanca que el marqués de Salamanca concibió y diseñó para dar lujo y exclusividad a una ciudad en expansión."
          ],
          "en": [
            "One day, after walking through the place that inspired her, the Plaza Mayor of her beloved Salamanca, she made her way home. Going down Calle Padilleros, she caught sight of a sign. A shop was for rent. It was 9 o'clock in the morning. By 11 o'clock, she had rented it. She had taken her first step out of her home city and out of the province of Salamanca. She reached Barcelona. She crossed Spain's borders. She won recognition in Paris, Milan and London. She came to know success. She opened stores in fashion's most famous cities. And when she had travelled every road, she found the ideal place to be in the capital of her own country. Coincidence or not, it was waiting for her in Madrid's Barrio de Salamanca, the neighbourhood the Marqués de Salamanca conceived and designed to bring luxury and exclusivity to an expanding city."
          ]
        }
      },
      {
        "id": "b12",
        "tipo": "foto",
        "src": "/media/web/img/blog/20-la-nina-de-la-aguja/fely-campo-blog-la-nina-de-la-aguja-foto-134.webp",
        "alt": "Desfile final de Fely Campo con varias modelos en pasarela",
        "pie": {
          "es": "Alcanzó el reconocimiento en París, Milán y Londres.",
          "en": "She won recognition in Paris, Milan and London."
        }
      },
      {
        "id": "b13",
        "tipo": "texto",
        "texto": {
          "es": [
            "Ideó un atelier tienda con encanto propio y la emoción que la aguja y el dedal le habían transmitido. Tímida como era y siempre lo fue, no colgó un cartel en la puerta. No escribió su nombre. Prefirió alojarse en un edificio donde de día el portero mantenía el portal abierto e indicaba adónde dirigirse a quienes preguntaban por ella. La Niña de la Aguja facilitaba con discreción las instrucciones y la dirección, calle de Jorge Juan 29, primero exterior derecha.",
            "Al subir las escaleras de madera que crujen al unísono de los pasos, el índice de tantas manos conocidas y menos conocidas aprieta el botón del timbre. A veces abre ella misma, a veces alguien la ayuda. Al cruzar el umbral, se penetra en el mundo de la Niña de la Aguja. Con aprecio agradece el aprecio. Con cariño recibe y despide.",
            "Cuando una clienta la visita, la Niña de la Aguja se detiene. A veces sentada, a veces de pie. Observa unos instantes. Se levanta. Se aleja. Vuelve y tiende una prenda. Retrocede unos pasos. Se fija en la imagen reflejada en el espejo. Dos miradas se cruzan. Una sonrisa ilumina la cara que observa desde el espejo. La esencia está captada. La mujer lucirá bella, feliz, contenta. Tímida e insegura, con mayor o menor autoestima, se sentirá segura."
          ],
          "en": [
            "She dreamed up an atelier-boutique with a charm all its own, carrying the emotion the needle and thimble had given her. Shy as she was, and always had been, she hung no sign on the door. She wrote no name. She preferred to settle into a building where, by day, the doorman kept the entrance open and told whoever asked for her where to go. The Needle Girl quietly gave out the instructions and the address: Calle de Jorge Juan 29, first floor, exterior right.",
            "Climbing the wooden stairs that creak in time with each footstep, the finger of so many hands — familiar and less familiar — presses the doorbell. Sometimes she opens the door herself, sometimes someone helps her. Crossing the threshold, one steps into the world of the Needle Girl. With appreciation, she gives thanks for being appreciated. With warmth, she welcomes and bids farewell.",
            "When a client visits her, the Needle Girl pauses. Sometimes seated, sometimes standing. She observes for a moment. She rises. She steps away. She comes back, holding out a garment. She takes a few steps back. She studies the reflection in the mirror. Two gazes meet. A smile lights up the face looking back from the glass. The essence has been captured. The woman will look beautiful, happy, content. Shy and unsure, with more or less self-confidence, she will feel safe."
          ]
        }
      },
      {
        "id": "b14",
        "tipo": "cita",
        "texto": {
          "es": "El antaño se quedó atrás, el presente es presente y el futuro se esboza en el horizonte, pensó la Niña de la Aguja una mañana cuando se asomó al balcón del atelier madrileño. Los recuerdos se precipitaban, las vivencias avivaban las emociones.",
          "en": "\"What came before is behind now, the present is present, and the future is only sketched on the horizon,\" the Needle Girl thought one morning, leaning over the balcony of her Madrid atelier. Memories rushed forward; her experiences stirred her emotions."
        },
        "autor": {
          "es": "",
          "en": ""
        }
      },
      {
        "id": "b15",
        "tipo": "texto",
        "texto": {
          "es": [
            "Un día cualquiera la Niña de la Aguja camina por el barrio de Salamanca. Bajando por la calle de Jorge Juan, tiene la mirada dirigida en otra dirección. Observa en retrospectiva la imagen reflejada en los espejos de los amplios escaparates.",
            "La Niña de la Aguja ha perdido miedo a la aguja. El dedal no le hace daño. Los pinchazos no la duelen. Las llamas delicadas de los dedos delgaditos se han acostumbrado a la aguja adquiriendo su propia protección. La cautela se centra en domar la aguja para proteger a la persona que prueba una prenda. Con suavidad ajusta el vestido a las curvas del cuerpo para transmitir la belleza en sus múltiples variaciones. Combina los colores al son de las tonalidades. Deben resaltar los tonos del pelo, la piel, los ojos. La esencia ha de prevalecer."
          ],
          "en": [
            "One ordinary day, the Needle Girl is walking through the Barrio de Salamanca. Going down Calle de Jorge Juan, her gaze is turned elsewhere. She watches, in hindsight, her own reflection in the mirrors of the wide shop windows.",
            "The Needle Girl has lost her fear of the needle. The thimble no longer hurts her. The pricks no longer sting. Her once so delicate fingertips have grown used to the needle, developing their own protection. Her caution now centres on taming the needle, to protect whoever is trying on a garment. Gently, she fits the dress to the curves of the body, to convey beauty in all its many forms. She combines colours to the rhythm of their tones. They must bring out the shades of the hair, the skin, the eyes. The essence must always come first."
          ]
        }
      },
      {
        "id": "b16",
        "tipo": "foto",
        "src": "/media/web/img/blog/20-la-nina-de-la-aguja/fely-campo-blog-la-nina-de-la-aguja-retrato-atelier-novias-medida.webp",
        "alt": "Retrato de Fely Campo riendo en su atelier",
        "pie": {
          "es": "La Niña de la Aguja, hoy.",
          "en": "The Needle Girl, today."
        }
      },
      {
        "id": "b17",
        "tipo": "texto",
        "texto": {
          "es": [
            "De pronto se para delante de un amplio portal en el número 5 de la calle de Jorge Juan. Donde antes se abría paso a los carruajes, la niña adulta entra con pasos firmes. Levanta la mirada ante el señor que le abre la pesada puerta de madera. Saluda con discreción. Vacila un instante ante los peldaños que conducen al interior. Contempla el entorno. Vuelve a dar las gracias a su madre que un día cuando tenía trece años le pusiera una aguja en la mano y un dedal en el dedo.",
            "Debió aprender un oficio. Hubo de hacer algo útil. Lo hizo. Lo consiguió. Cayó muchas veces. Se levantó otras tantas. Se mantuvo erguida. Y llegó. Llegó lejos."
          ],
          "en": [
            "Suddenly she stops in front of a wide doorway at number 5, Calle de Jorge Juan. Where carriages once passed through, the grown woman now walks in with a firm step. She looks up at the man opening the heavy wooden door for her. She greets him with quiet discretion. She hesitates a moment before the steps leading inside. She takes in her surroundings. She gives thanks again to her mother, who, one day when she was thirteen, placed a needle in her hand and a thimble on her finger.",
            "She had to learn a trade. She had to do something useful. She did it. She achieved it. She fell many times. She rose just as many. She stood tall. And she arrived. She arrived far."
          ]
        }
      },
      {
        "id": "b18",
        "tipo": "cita",
        "texto": {
          "es": "Quizás en aquel instante se acordase de lo que Rafael Farina cantaba: \"mi Salamanca bendita… ay que te quiero, te quiero… ay que te quiero cuanto te quiero… Salamanca bendita, que cosita bonita tiene el tesoro de tu joyero. Salamanca bendita, tres cositas bonitas: cante, flamenco, toro y torero.\"",
          "en": "Perhaps in that instant she remembered what Rafael Farina used to sing: \"my blessed Salamanca… oh how I love you, I love you… oh how I love you, how much I love you… blessed Salamanca, what a pretty little thing your jewel box holds. Blessed Salamanca, three pretty little things: song, flamenco, bull and bullfighter.\""
        },
        "autor": {
          "es": "Rafael Farina",
          "en": "Rafael Farina"
        }
      },
      {
        "id": "b19",
        "tipo": "texto",
        "texto": {
          "es": [
            "Y desde la lejanía a la Niña de la Aguja le viene el susurro de su madre, \"tres cositas bonitas… y una cuarta, la Niña de la Aguja, la cuarta cosita bonita que tiene Salamanca\".",
            "Le abren la puerta del portal. La saludan con respeto y admiración. La han reconocido.",
            "\"¡Buenas tardes, Señora!\", la Niña de la Aguja escucha su nombre. \"Un placer haberla conocido. Bienvenida\".",
            "La emoción le provoca inseguridad. Se frena un instante antes de subir la escalera. Debe imponer autoridad a su propia timidez. Había aprendido camuflarla sin conseguir vencerla. Da la vuelta hacia atrás como si buscase un refugio para esconderse. Su familia, amigos íntimos, conocidos cercanos y caras desconocidas la esperan en la amplia sala de la segunda planta. Recobró la entereza. Afuera desde las calles más bonitas de Madrid sus modelos y diseños la saludaban y acompañaban.",
            "Clava los ojos en la escalera blanca que culebrea a la segunda planta suavizando las esquinas y aligerando sus pasos. Peldaño tras peldaño se acerca al salón de actos.",
            "Alguien le abre la puerta. La vuelven a saludar con admiración y respeto. Los aplausos se escuchan desde el interior. El acto empieza. Se anuncia el nombre de la invitada de honor a la cual rinden homenaje."
          ],
          "en": [
            "And from somewhere far away, her mother's whisper reaches the Needle Girl: \"three pretty little things… and a fourth: the Needle Girl, the fourth pretty thing that Salamanca has.\"",
            "They open the door for her. They greet her with respect and admiration. They have recognised her.",
            "\"Good afternoon, Señora!\" the Needle Girl hears her own name. \"It's a pleasure to have met you. Welcome.\"",
            "The emotion leaves her unsteady. She pauses a moment before climbing the stairs. She must impose authority over her own shyness. She had learned to disguise it, without ever quite overcoming it. She turns back, as if looking for somewhere to hide. Her family, close friends, familiar faces and unfamiliar ones wait for her in the wide hall on the second floor. She found her composure again. Outside, from the loveliest streets of Madrid, her own designs and models seemed to greet her and walk beside her.",
            "She fixes her eyes on the white staircase winding up to the second floor, its corners softened, its steps light beneath her feet. Step by step, she draws closer to the hall where the ceremony is being held.",
            "Someone opens the door for her. They greet her again, with admiration and respect. Applause can be heard from inside. The event begins. The name of the guest of honour being celebrated is announced."
          ]
        }
      },
      {
        "id": "b20",
        "tipo": "cita",
        "texto": {
          "es": "Bienvenidos al Foro de Mujeres Extraordinarias. Nos gustaría presentarles y darle las gracias a nuestra invitada …, y las miradas giran a la puerta por la cual entra la Niña de la Aguja.",
          "en": "\"Welcome to the Forum of Extraordinary Women. We would like to introduce, and to thank, our guest…\" — and every gaze turns to the door through which the Needle Girl walks in."
        },
        "autor": {
          "es": "",
          "en": ""
        }
      },
      {
        "id": "b21",
        "tipo": "foto",
        "src": "/media/web/img/blog/20-la-nina-de-la-aguja/fely-campo-blog-la-nina-de-la-aguja-foto.webp",
        "alt": "Fely Campo en un acto de homenaje, vestida de blanco, junto a una pantalla y un maniquí",
        "pie": {
          "es": "El Foro de Mujeres Extraordinarias.",
          "en": "The Forum of Extraordinary Women."
        }
      },
      {
        "id": "b22",
        "tipo": "texto",
        "texto": {
          "es": [
            "La emoción no le permite proceder. Las lágrimas humedecen los ojos. Tímida al exterior, extrovertida en el interior, venció y convenció.",
            "Venció y convenció desde donde Miguel de Unamuno advirtió que vencer no era convencer. A la Niña de la Aguja le sobró fuerza para oponerse y resistir a las injusticias. Convenció porque convencer significa persuadir. Y para persuadir a ella no le faltó ni lucha, ni razón, ni derecho. La Niña de la Aguja levanta la mirada hacia la pantalla grande. Avista su nombre escrito con letras blancas sobre fondo negro."
          ],
          "en": [
            "The emotion won't let her move forward. Tears well in her eyes. Shy on the outside, bold within, she had triumphed, and she had convinced.",
            "She had triumphed and convinced from the very place where Miguel de Unamuno once warned that to triumph was not the same as to convince. The Needle Girl never lacked the strength to stand up to injustice and resist it. She convinced, because to convince is to persuade — and to persuade, she lacked neither struggle, nor reason, nor right. The Needle Girl lifts her eyes to the big screen. She sees her name written in white letters on a black background."
          ]
        }
      },
      {
        "id": "b23",
        "tipo": "cita",
        "texto": {
          "es": "Fely Campo. Más de 50 años dedicada a la moda.",
          "en": "Fely Campo. More than 50 years devoted to fashion."
        },
        "autor": {
          "es": "",
          "en": ""
        }
      },
      {
        "id": "b24",
        "tipo": "texto",
        "texto": {
          "es": [
            "A Fely, Fely Campo, con cariño y mucho más…, B.S.",
            "El 23 de abril de 2024, El Parador de Ávila, Ávila. El 21 de abril de 2024, La Casa de la Princesa, Madrid. B.S.",
            "Gracias Bozhana Stoeva por crear este maravilloso cuento, y gracias por dejarnos compartirlo con todos vosotros. Os animamos a todos a leer su trabajo en su página invisiblevisible.es."
          ],
          "en": [
            "To Fely, Fely Campo, with love and so much more…, B.S.",
            "23 April 2024, El Parador de Ávila, Ávila. 21 April 2024, La Casa de la Princesa, Madrid. B.S.",
            "Thank you, Bozhana Stoeva, for creating this wonderful story, and for letting us share it with all of you. We encourage everyone to read her work on her site, invisiblevisible.es."
          ]
        }
      }
    ]
  },
  {
    "slug": "colecciones-de-novia-la-busqueda-del-traje-de-novia",
    "publicado": true,
    "fecha": "2022-01-10",
    "imagenCubierta": "/media/web/img/blog/04-busqueda-trabje-novia/fely-campo-blog-busqueda-trabje-novia-traje-portada.webp",
    "titulo": {
      "es": "Colecciones de novia: la búsqueda del traje de novia",
      "en": "Bridal collections: the search for the wedding gown"
    },
    "resumen": {
      "es": "Cuándo salen las nuevas colecciones, cómo elegir marca, atelier a medida o vestido de colección, y un repaso a las siluetas: la guía de Fely Campo para encontrar tu vestido de novia.",
      "en": "When the new collections launch, how to choose a brand, a made-to-measure atelier or a collection dress, and a rundown of silhouettes: Fely Campo's guide to finding your wedding dress."
    },
    "bloques": [
      {
        "id": "b1",
        "tipo": "texto",
        "texto": {
          "es": [
            "La búsqueda del vestido de novia perfecto es una de las prioridades en el proceso de organizar uno de los eventos más especiales de cualquier novia. Es un momento muy especial, ya que el vestido es el reflejo de los sueños en su vida futura; debe realzar su personalidad y acompañarla; resaltará zonas de su cuerpo que deses mostrar y tendrá que disimular aquellas con las que no se sienta tan satisfecha.",
            "A continuación te proponemos una serie de tips para elegir tu vestido de novia."
          ],
          "en": [
            "The search for the perfect wedding dress is one of the priorities when planning one of the most special events in any bride's life. It's a very special moment, since the dress reflects her dreams for the future; it should enhance her personality and accompany her; it will highlight the parts of her body she wants to show off, and play down the ones she feels less confident about.",
            "Below we offer a series of tips for choosing your wedding dress."
          ]
        }
      },
      {
        "id": "b2",
        "tipo": "subtitulo",
        "texto": {
          "es": "La elección del vestido de novia entre las nuevas colecciones de novia",
          "en": "Choosing your wedding dress among the new bridal collections"
        }
      },
      {
        "id": "b3",
        "tipo": "texto",
        "texto": {
          "es": [
            "Al principio es normal que el proceso pueda resultarte abrumador. Las opciones hoy en día son infinitas y a veces ni si quiera podemos saber dónde ni cuándo comenzar a mirar.",
            "Lo ideal es empezar a buscar referencias de lo que buscamos una vez que los diseñadores han presentado sus nuevas colecciones de novia."
          ],
          "en": [
            "At first it's normal for the process to feel overwhelming. The options today are endless, and sometimes we don't even know where or when to start looking.",
            "The best approach is to start gathering references once designers have presented their new bridal collections."
          ]
        }
      },
      {
        "id": "b4",
        "tipo": "subtitulo",
        "texto": {
          "es": "Cuándo se presentan las últimas colecciones de novia",
          "en": "When the latest bridal collections are presented"
        }
      },
      {
        "id": "b5",
        "tipo": "texto",
        "texto": {
          "es": [
            "Y es que mezclar tus gustos con las tendencias del momento y las nuevas propuestas harán que seas una novia diferente.",
            "Para ello debemos tener en cuenta el calendario de nuevas colecciones nupciales. El año antes a tu boda, cada diseñador o firma de vestidos de novia presenta sus colecciones para el año siguiente, a través de pasarelas, eventos o editoriales de colecciones de novias para el próximo año.",
            "De aquí cada novia puede recopilar imágenes, un año antes del gran día, que le sirvan para comenzar a soñar e ir conociendo lo que les gusta y lo que no. Entre las pasarelas referentes que encontramos en España para encontrar inspiración de trajes de novia, encontramos la Barcelona Bridal Fashion Week. Además de las internacionales o las de alta costura que nos harán hacernos una idea de lo que buscamos y como queremos que sea nuestra ceremonia."
          ],
          "en": [
            "Blending your own taste with current trends and new proposals is what will make you a bride with a style all her own.",
            "To do that, we need to keep the calendar of new bridal collections in mind. The year before your wedding, each designer or bridal label presents its collections for the following year, through runway shows, events or bridal editorials.",
            "From there, each bride can gather images, a year ahead of the big day, to help her start dreaming and get a sense of what she does and doesn't like. Among the leading runways in Spain for bridal inspiration is Barcelona Bridal Fashion Week, alongside international and haute couture shows that help you get an idea of what you're looking for and how you want your ceremony to feel."
          ]
        }
      },
      {
        "id": "b6",
        "tipo": "foto",
        "src": "/media/web/img/blog/04-busqueda-trabje-novia/fely-campo-blog-busqueda-trabje-novia-059-1.webp",
        "alt": "Desfile Fely Campo en pasarela de novias Barcelona Bridal Fashion Week",
        "pie": {
          "es": "Desfile Fely Campo en pasarela de novias Barcelona Bridal Fashion Week.",
          "en": "A Fely Campo show on the Barcelona Bridal Fashion Week runway."
        }
      },
      {
        "id": "b7",
        "tipo": "texto",
        "texto": {
          "es": [
            "Esto simplemente servirá de inspiración para planear los primeros detalles de una boda y para tener más claro el estilo al comenzar la búsqueda del atelier de novia o la tienda de novia. Conocer tus gustos, justo antes de comenzar a probarnos los vestidos de novia que han adaptado desde las pasarelas a nuestras bodas, puede ser muy importante para que estos primeros momentos no nos abrumen."
          ],
          "en": [
            "This is simply meant as inspiration for planning the first details of a wedding and getting a clearer sense of style before starting the search for a bridal atelier or bridal store. Knowing your own taste just before trying on the wedding dresses adapted from the runways to real weddings can matter a great deal, so these first steps don't feel overwhelming."
          ]
        }
      },
      {
        "id": "b8",
        "tipo": "subtitulo",
        "texto": {
          "es": "Las novias de otoño e invierno también tienen su sitio",
          "en": "Autumn and winter brides have their place too"
        }
      },
      {
        "id": "b9",
        "tipo": "texto",
        "texto": {
          "es": [
            "Y por supuesto estas novias también tienen su hueco en las propuestas de los diseñadores. Las fechas para comenzar la búsqueda son similares.",
            "Cada vez son más los diseñadores que presentan entre sus novedades de vestidos de novia propuestas de colecciones de novia para invierno y otoño o piezas que permiten adaptar los vestidos a esta época del año: con abrigos de novia, capas de novia, chaquetas de novia, etc."
          ],
          "en": [
            "And of course, these brides also have their place in designers' proposals. The timing for starting the search is similar.",
            "More and more designers are including autumn and winter bridal collections among their new releases, or pieces that adapt wedding dresses to this time of year: bridal coats, bridal capes, bridal jackets, and so on."
          ]
        }
      },
      {
        "id": "b10",
        "tipo": "foto",
        "src": "/media/web/img/blog/04-busqueda-trabje-novia/fely-campo-blog-busqueda-trabje-novia-invierno-otono.webp",
        "alt": "Vestido de novia con abrigo a juego",
        "pie": {
          "es": "Vestido de novia con abrigo a juego.",
          "en": "A wedding dress with a matching coat."
        }
      },
      {
        "id": "b11",
        "tipo": "texto",
        "texto": {
          "es": [
            "En definitiva, tú decides cuándo te sientes cómoda para comenzar a mirar adaptándote a tu fecha; pero nosotros te recomendamos entre unos 12 o 7 meses antes del día de los sueños. Tienes que tener en cuenta que una vez que lo eliges te tomarán medidas y comenzarás a realizar las pruebas que sean necesarias para terminarlo de adaptar y ultimar todos los detalles."
          ],
          "en": [
            "At the end of the day, you decide when you feel ready to start looking, based on your own date — but we recommend somewhere between 7 and 12 months before the big day. Keep in mind that once you choose your dress, you'll be measured and will go through however many fittings are needed to finish adapting it and getting every last detail right."
          ]
        }
      },
      {
        "id": "b12",
        "tipo": "subtitulo",
        "texto": {
          "es": "La elección del vestido de novias: Marcas de vestidos de novia",
          "en": "Choosing your wedding dress: bridal brands"
        }
      },
      {
        "id": "b13",
        "tipo": "texto",
        "texto": {
          "es": [
            "Hay novias que tienen muy clara su idea en referencia al estilo, pero las dudas les asaltan cuando hablamos de quién se encargará de llevar a cabo la confección de su vestido de novia.",
            "También encontramos quien prefiere un proceso en el que todo sea sorpresa e ir dejándose llevar por las emociones en vez de ir buscando las novedades y las últimas colecciones de novia en la búsqueda de su traje. Sea como sea, aquí te damos algunas claves para saber cuál es tu firma de vestidos de novia que te traiga las últimas tendencias de la moda nupcial.",
            "Lo importante es dar con la firma que nos enamore y cumpla todos esos deseos que hemos ido recopilando. Elegir el vestido de tu boda es un proceso muy íntimo, especial y muy emocionante en el que por encima de todo necesitas sentirte identificada y entendida.",
            "Lo primero es que te sientas identificada con el universo que la marca te propone; que sientas que sus valores y su manera de hacer se adapte a los tuyos y a tu pensamiento, ya que tu vestido de novia transmitirá gran parte de tu historia.",
            "Pero lo que es crucial es la primera cita, el feeling que sientes con el diseñador de tu vestido de novia (en caso de que decidas ir a un atelier a medida) o con la persona que te hará el vestido en una tienda (en caso de que el vestido que elijas sea en tienda a partir de una colección). El sentirte entendida cuando le expones tus ideas, la complicidad que adquieras con los profesionales y el que te hagan sentir tranquila porque te van a dejar ser tú misma y que tomes decisiones y detalles asesorándote…",
            "Además es importante que confíes en una marca de novia que te demuestre su profesionalidad. En la primera prueba podrás ver cómo te asesoran en cuanto a siluetas y cortes, ya que lo primordial es encontrar un vestido que favorezca tu silueta, color de piel, etc.",
            "Esta complicidad que tengas con la marca que confeccione el vestido de tu boda irá creciendo en cada prueba y te hará disfrutar del proceso de creación, sintiéndote especial y única meses antes de la boda, para que todo sean buenas vibraciones en el gran día."
          ],
          "en": [
            "Some brides have a very clear idea of the style they want, but doubts creep in when it comes to who will actually make their wedding dress.",
            "There are also brides who prefer the whole process to be a surprise, letting themselves be guided by emotion rather than chasing the latest news and collections in their search for a dress. Either way, here are a few pointers to help you find the bridal label that will bring you the latest in bridal fashion.",
            "What matters is finding the label that wins you over and fulfils everything you've been dreaming of. Choosing your wedding dress is a very intimate, special and exciting process, in which, above all, you need to feel understood and identified with.",
            "The first thing is to feel identified with the world the brand proposes — to feel that its values and way of doing things align with yours and with how you see things, since your wedding dress will convey a great part of your story.",
            "But what's truly crucial is the first appointment — the connection you feel with the designer of your dress (if you go for a made-to-measure atelier) or with the person who will make your dress in a store (if you choose a dress from a collection). Feeling understood as you share your ideas, the closeness you build with the professionals, and being made to feel at ease because they'll let you be yourself while guiding your decisions and details…",
            "It's also important to trust a bridal brand that shows real professionalism. At your first fitting you'll see how they advise you on silhouettes and cuts, since the key is finding a dress that flatters your figure, skin tone and so on.",
            "This closeness you build with the brand making your wedding dress will keep growing with every fitting, and will make you enjoy the process of watching your dress come to life, feeling special and unique in the months before the wedding, so everything is good vibes on the big day."
          ]
        }
      },
      {
        "id": "b14",
        "tipo": "foto",
        "src": "/media/web/img/blog/04-busqueda-trabje-novia/fely-campo-blog-busqueda-trabje-novia-introspeccion46.webp",
        "alt": "Detalle traje de novia con sobrefalda y encaje Fely Campo colección Introspección",
        "pie": {
          "es": "Detalle traje de novia con sobrefalda y encaje Fely Campo colección Introspección.",
          "en": "Detail of a wedding gown with an overskirt and lace, Fely Campo Introspección collection."
        }
      },
      {
        "id": "b15",
        "tipo": "subtitulo",
        "texto": {
          "es": "Cómo elegir entre vestido de novia a medida o vestido de novia de colección",
          "en": "How to choose between a made-to-measure wedding dress or a collection dress"
        }
      },
      {
        "id": "b16",
        "tipo": "texto",
        "texto": {
          "es": [
            "Esta probablemente sea una de las primeras y más importantes dudas a las que se enfrenta una novia, una vez que da el paso de sumergirse en la complicada elección entre cientos de vestidos de novia. Y es que las dos opciones son fantásticas, ninguna es mejor que otra, cada una de ellas te muestra momentos diferentes y especiales sobre el proceso de creación del vestido de novia y dependerán enteramente de las sensaciones que la novia tenga en sus primeros días de búsqueda del vestido de novia perfecto.",
            "A continuación te damos unas pinceladas sobre las diferencias que pueden hacer que te decantes por uno u otro; y si aún así no te decides, te damos una solución para que te dejes llevar por tus sueños y sensaciones del momento a la hora de elegir tu traje de novia perfecto."
          ],
          "en": [
            "This is probably one of the first, and most important, questions a bride faces once she takes the plunge into the complicated choice among hundreds of wedding dresses. Both options are fantastic — neither is better than the other; each offers different, special moments in the process of creating your wedding dress, and it will depend entirely on how the bride feels in the first days of searching for her perfect dress.",
            "Below we give you a few pointers on the differences that might tip you toward one or the other; and if you still can't decide, we'll give you a solution so you can simply let yourself be guided by your dreams and instincts in the moment, when choosing your perfect wedding dress."
          ]
        }
      },
      {
        "id": "b17",
        "tipo": "subtitulo",
        "texto": {
          "es": "Atelier de novias: la novia a medida",
          "en": "The bridal atelier: the made-to-measure bride"
        }
      },
      {
        "id": "b18",
        "tipo": "texto",
        "texto": {
          "es": [
            "Como hemos visto en post anteriores, los atelieres de moda son los espacios creativos de cada diseñador."
          ],
          "en": [
            "As we've seen in previous posts, fashion ateliers are each designer's creative space."
          ]
        }
      },
      {
        "id": "b19",
        "tipo": "foto",
        "src": "/media/web/img/blog/04-busqueda-trabje-novia/fely-campo-blog-busqueda-trabje-novia-nosotros-campo5.webp",
        "alt": "Interior del atelier de novias Fely Campo",
        "pie": {
          "es": "Interior del atelier de novias Fely Campo.",
          "en": "Inside the Fely Campo bridal atelier."
        }
      },
      {
        "id": "b20",
        "tipo": "texto",
        "texto": {
          "es": [
            "En cuanto al atelier de novias, el diseñador vive la complicidad y el proceso de crear un vestido de novia junto a la complicidad de cada uno. El proceso creativo se vuelve completamente personalizado a la hora de que una novia acuda a un atelier de novias para realizar un vestido de novia a medida. La novia interviene en el proceso creativo, creándose vestidos únicos para cada una de ellas, con un sello de identidad que aúna la personalidad de la novia y la firma.",
            "En el atelier de novias Fely Campo, tanto en el de Salamanca como en el de Oviedo, el sueño y la personalidad de cada novia es la fuente de inspiración de cada vestido que se crea."
          ],
          "en": [
            "At a bridal atelier, the designer lives through the closeness and the process of creating a wedding dress together with each bride. The creative process becomes entirely personalised when a bride visits a bridal atelier to have a made-to-measure dress created. The bride takes part in the creative process, resulting in a unique dress for each of them, carrying a mark of identity that brings together the bride's personality and the label's own.",
            "At the Fely Campo bridal atelier, both in Salamanca and in Oviedo, each bride's dream and personality are the source of inspiration for every dress created."
          ]
        }
      },
      {
        "id": "b21",
        "tipo": "subtitulo",
        "texto": {
          "es": "La colección de novias",
          "en": "The bridal collection"
        }
      },
      {
        "id": "b22",
        "tipo": "texto",
        "texto": {
          "es": [
            "Las colecciones de novias son las propuestas que cada temporada diseña cada creador de moda de novias. Estas suelen reflejar la esencia de la firma en toda su esencia, muestran sus valores y lo más característico de su manera de entender a las novias, sus valores y cómo cada creador adapta las tendencias y la estética de las novias a su firma .",
            "Con las colecciones de novias muchas tiendas permiten que dentro de la colección puedas hacer pequeñas modificaciones, por lo que se adaptan a ti para que el vestido cumpla todas tus expectativas y sueños.",
            "Los vestidos de colección de novias de Fely Campo reflejan todas sus ideas y buscan realzar al máximo la silueta de cada novia. Están cuidados al detalle y son concebidos para una mujer exigente en la calidad del producto que busca vestidos de novia hechos en España, con gran elegancia e identidad. Se cuida cada detalle para permitir a todas las novias soñar."
          ],
          "en": [
            "Bridal collections are the proposals each bridal designer creates every season. They tend to fully reflect the essence of the label, showing its values and the most characteristic traits of how that designer understands brides, and how each one adapts bridal trends and aesthetics to their own label.",
            "With collection dresses, many stores allow you to make small modifications within the collection, so the dress can be adapted to fulfil all your expectations and dreams.",
            "Fely Campo's collection wedding dresses reflect all of her ideas and aim to enhance every bride's silhouette to the fullest. Every detail is carefully considered, and they're designed for a discerning woman who wants a wedding dress made in Spain, with great elegance and identity. Every detail is looked after, to let every bride dream."
          ]
        }
      },
      {
        "id": "b23",
        "tipo": "subtitulo",
        "texto": {
          "es": "La posibilidad de tener las dos",
          "en": "The option of having both"
        }
      },
      {
        "id": "b24",
        "tipo": "texto",
        "texto": {
          "es": [
            "Probablemente si estas debatiéndote mucho ante esta elección, la mejor decisión será poder acudir a algún lugar que te permita experimentar los dos procesos e incluso entremezclarlos, permitiéndote adquirir un vestido de colección de novias pero que te posibilte el realizar modificaciones en tejidos, siluetas, añadir o eliminar cosas, combinar varios vestidos, etc.",
            "Lo importante es que sea cual sea el vestido de novia que quieras, de colección o a medida, es la experiencia y complicidad que consigas con la firma que se encargará de tu vestido de boda lo que hará del proceso de ver nacer tu vestido de novia algo mágico."
          ],
          "en": [
            "If you're still torn on this choice, your best bet is probably to find a place that lets you experience both processes, and even blend them — letting you buy a collection dress while still making modifications to fabrics and silhouettes, adding or removing details, combining several dresses, and so on.",
            "What matters is that whichever wedding dress you want, from a collection or made-to-measure, it's the experience and closeness you build with the label making your dress that turns watching your wedding dress come to life into something magical."
          ]
        }
      },
      {
        "id": "b25",
        "tipo": "subtitulo",
        "texto": {
          "es": "Estilos de novias",
          "en": "Bridal styles"
        }
      },
      {
        "id": "b26",
        "tipo": "texto",
        "texto": {
          "es": [
            "Cada novia hace una declaración de intenciones sobre su vida futura y una declaración de estilo. Se trata, probablemente, del vestido más importante de tu vida y no es tarea fácil encontrarlo. Hay muchísimos estilos de vestidos de novia, siluetas de novia, tendencias de novia, etc. Tendrás que encontrar aquellos que supongan un equilibrio entre lo que más te guste y que el patrón se adapte a lo que más te favorece. A continuación te mostramos un resumen de lo que podrás encontrar cuando comiences la gran búsqueda."
          ],
          "en": [
            "Every bride makes a statement about her future life, and a statement of style. It's probably the most important dress of your life, and it's no easy task to find it. There are countless wedding dress styles, bridal silhouettes, bridal trends and so on. You'll need to find the balance between what you love most and the cut that best flatters you. Below is a summary of what you'll come across once you start the great search."
          ]
        }
      },
      {
        "id": "b27",
        "tipo": "subtitulo",
        "texto": {
          "es": "Siluetas de vestidos de novia",
          "en": "Wedding dress silhouettes"
        }
      },
      {
        "id": "b28",
        "tipo": "texto",
        "texto": {
          "es": [
            "Dentro de cada silueta cada firma te propondrá los cortes que más se adapten a tu cuerpo, especialmente si confeccionas un vestido en un atelier de novia que te permite realizar más cambios, incluso aunque los vestidos sean de colección. Hoy de manera resumida te comentamos los cortes más característicos de las colecciones de novia."
          ],
          "en": [
            "Within each silhouette, every label will offer you the cuts that best suit your body — especially if you're having a dress made at a bridal atelier that allows more changes, even for collection dresses. Here's a quick rundown of the most characteristic cuts found in bridal collections."
          ]
        }
      },
      {
        "id": "b29",
        "tipo": "subtitulo",
        "texto": {
          "es": "Vestidos de novia con línea A",
          "en": "A-line wedding dresses"
        }
      },
      {
        "id": "b30",
        "tipo": "foto",
        "src": "/media/web/img/blog/04-busqueda-trabje-novia/fely-campo-blog-busqueda-trabje-novia-novias.webp",
        "alt": "Vestido de novia silueta A colección Introspección Fely Campo",
        "pie": {
          "es": "Vestido de novia silueta A colección Introspección Fely Campo.",
          "en": "A-line wedding dress, Fely Campo Introspección collection."
        }
      },
      {
        "id": "b31",
        "tipo": "texto",
        "texto": {
          "es": [
            "Es una silueta de novia en la que el vestido coge volumen a partir de la cintura dibujando una A, mientras que en el pecho suele ser ajustado. Este tipo de vestidos lo encontramos con más o menos volumen, y el volumen puede empezar más arriba o más abajo. Los tejidos de novia pueden ser infinitos, encontrando faldas con varias capas de tul que darán ese aire romántico y de princesa, con tejidos más estructurados que le dan un aire más minimalista. Es una silueta muy versátil que se puede adaptar a muchos tipos de personalidad y estilos. Dentro de este tipo de silueta encontramos el corte princesa, que es el de volumen más exagerado, de cuento, que suelen elegirlo novias que quieren una boda más tradicional o una celebración muy significativa."
          ],
          "en": [
            "This is a bridal silhouette where the dress gains volume from the waist down, tracing an A shape, while it's usually fitted at the bust. You'll find this style with more or less volume, and that volume can start higher or lower on the body. The fabrics used can be endless — skirts with several layers of tulle give it a romantic, princess-like feel, while more structured fabrics lend it a more minimalist look. It's a very versatile silhouette that suits many personalities and styles. Within this type is the princess cut, the most dramatically voluminous, fairy-tale version — usually chosen by brides who want a more traditional wedding or a highly formal celebration."
          ]
        }
      },
      {
        "id": "b32",
        "tipo": "subtitulo",
        "texto": {
          "es": "Vestidos sirena de novia",
          "en": "Mermaid wedding dresses"
        }
      },
      {
        "id": "b33",
        "tipo": "foto",
        "src": "/media/web/img/blog/04-busqueda-trabje-novia/fely-campo-blog-busqueda-trabje-novia-pv2019-41.webp",
        "alt": "Vestido de novia silueta sirena colección Savia Novia Fely Campo",
        "pie": {
          "es": "Vestido de novia silueta sirena colección Savia Novia Fely Campo.",
          "en": "Mermaid-silhouette wedding dress, Fely Campo Savia Novia collection."
        }
      },
      {
        "id": "b34",
        "tipo": "texto",
        "texto": {
          "es": [
            "El vestido sirena es un vestido conocido por enfatizar la silueta de la novia, ya que realza las curvas naturales de la silueta de la mujer, incluso las enfatiza aún más el volumen que crea dando al cuerpo femenino otra curva en la parte baja del vestido. Esto permite que pueda ser un vestido con gran cola o con menos, para adaptarse a lo que cada una quiera. En cuanto al escote, permite muchísimas opciones."
          ],
          "en": [
            "The mermaid dress is known for emphasising the bride's silhouette, since it enhances the natural curves of the female figure — even accentuating them further with the extra curve it creates lower down the dress. This allows for a dress with a dramatic train or a shorter one, depending on what each bride wants. As for the neckline, it allows for a great many options."
          ]
        }
      },
      {
        "id": "b35",
        "tipo": "subtitulo",
        "texto": {
          "es": "Vestidos de novia con corte imperio",
          "en": "Empire-line wedding dresses"
        }
      },
      {
        "id": "b36",
        "tipo": "foto",
        "src": "/media/web/img/blog/04-busqueda-trabje-novia/fely-campo-blog-busqueda-trabje-novia-vestidos-boho.webp",
        "alt": "Vestido de novia con corte imperio",
        "pie": {
          "es": "Vestido de novia con corte imperio.",
          "en": "Empire-line wedding dress."
        }
      },
      {
        "id": "b37",
        "tipo": "texto",
        "texto": {
          "es": [
            "Se trata de otro vestido de novia con corte tradicional. El vestido de novia con corte imperio es un vestido con corte bajo el pecho y que luego cae con una silueta más o menos recta hasta los pies. El estilo boho y romántico busca mucho este tipo de siluetas ya que permiten combinar tejidos de novia muy fluidos y vaporosos, plisados, etc."
          ],
          "en": [
            "This is another wedding dress with a traditional cut. The empire-line wedding dress is cut just below the bust, then falls in a more or less straight silhouette down to the feet. This silhouette is a favourite of the boho and romantic styles, since it works beautifully with flowing, floaty fabrics, pleats, and so on."
          ]
        }
      },
      {
        "id": "b38",
        "tipo": "subtitulo",
        "texto": {
          "es": "Vestido silueta columna",
          "en": "Column-silhouette wedding dress"
        }
      },
      {
        "id": "b39",
        "tipo": "texto",
        "texto": {
          "es": [
            "Caracterizado por líneas rectas en toda la silueta del vestido de novia, este tipo de vestido permite que sean más ajustados marcando las curvas más femeninas o de una manera más relajada. Es muy versátil y lleva cortes de muchas maneras diferentes para resaltar los mejores detalles de la silueta de cada novia."
          ],
          "en": [
            "Defined by straight lines running the full length of the dress, this style can be more fitted, tracing the most feminine curves, or more relaxed. It's very versatile and comes in many different cuts to highlight each bride's best features."
          ]
        }
      },
      {
        "id": "b40",
        "tipo": "subtitulo",
        "texto": {
          "es": "Las tendencias de los trajes de novia",
          "en": "Wedding dress trends"
        }
      },
      {
        "id": "b41",
        "tipo": "texto",
        "texto": {
          "es": [
            "Las tendencias tienen que ver mucho con las siluetas y la personalidad de las novias. Siempre encontramos vestidos más clásicos y austeros, frente a otros más de cuento, de princesa, más románticos.",
            "Los bohemios y minimalistas desde hace varias temporadas se imponen por su comodidad, además de por cómo destacan la personalidad de la novia con unos sencillos cortes.",
            "Otra de las tendencias actuales son los vestidos de novia lenceros, ya que es la contraposición a los vestidos de volúmenes y excesos; reflejan al máximo el estilo del día a día de una novia diferente.",
            "Los trajes de dos piezas de novia, ya sean trajes pantalón o faldas, ganan protagonismo cada vez más. Y otro de los grandes reyes de las colecciones de trajes de novias desde 2018, que se impone con más fuerza en las nuevas colecciones de novia 2022, son piezas como abrigos de novia o sobrefaldas, ya que permiten tener vestidos versátiles que se adaptan a los distintos momentos de la boda y que la novia sorprenda dos veces; así la novia puede llevar una gran cola para la ceremonia y en el momento del baile, tener un vestido más sencillo que le dé gran comodidad."
          ],
          "en": [
            "Trends have a lot to do with silhouettes and each bride's personality. We always find more classic, understated dresses alongside more fairy-tale, princess-like, romantic ones.",
            "Boho and minimalist styles have been dominant for several seasons now, thanks to their comfort as well as how they let the bride's personality shine through simple cuts.",
            "Another current trend is lingerie-style wedding dresses, which stand in contrast to voluminous, more-is-more dresses; they fully reflect the everyday style of a very different kind of bride.",
            "Two-piece bridal outfits, whether trouser suits or skirt sets, are gaining more and more ground. And another of the great favourites in bridal collections since 2018 — pushed even further in the new 2022 bridal collections — are pieces like bridal coats or overskirts, since they allow for versatile dresses that adapt to the different moments of the wedding, letting the bride surprise everyone twice: wearing a dramatic train for the ceremony, then a simpler, far more comfortable dress once it's time to dance."
          ]
        }
      },
      {
        "id": "b42",
        "tipo": "foto",
        "src": "/media/web/img/blog/04-busqueda-trabje-novia/fely-campo-blog-busqueda-trabje-novia-inside-introspection-2-1.webp",
        "alt": "Vestido de novia Fely Campo cola de una capa y drapeado colección Inside Introspection",
        "pie": {
          "es": "Vestido de novia Fely Campo cola de una capa y drapeado colección Inside Introspection.",
          "en": "Fely Campo wedding dress with a single-layer train and draping, Inside Introspection collection."
        }
      },
      {
        "id": "b43",
        "tipo": "subtitulo",
        "texto": {
          "es": "La personalidad de la novia en su vestido de novia",
          "en": "A bride's personality in her wedding dress"
        }
      },
      {
        "id": "b44",
        "tipo": "texto",
        "texto": {
          "es": [
            "En definitiva, lo más importante es que la novia se sienta cómoda y sea un fiel reflejo de su personalidad y de lo que quiere transmitir de ella uno de los días más importantes de su vida. Y es algo a lo que tanto las tendencias como las siluetas deben adaptarse por encima de todo.",
            "Si estás buscando tu vestido de novia perfecto, disfruta de la búsqueda y déjate asesorar siendo fiel a tu esencia para tener el vestido de novia de alta costura, ya sea un vestido de novia de colección o de vestido de novia a medida en atelier.",
            "Visita el Atelier de novia de Fely Campo de vestidos de novia y deja que la diseñadora te haga soñar. Siente la complicidad con Fely Campo de encontrar TU VESTIDO DE NOVIA junto a un equipo con años de experiencia, que te guiará y te hará vivir un sueño.",
            "Suscríbete a nuestro canal de YouTube para sumergirte en el maravilloso mundo de Fely Campo y seguir de cerca su participación en grandes eventos."
          ],
          "en": [
            "In the end, what matters most is that the bride feels comfortable and that the dress is a true reflection of her personality and of what she wants to convey on one of the most important days of her life. And that's something both trends and silhouettes need to adapt to, above everything else.",
            "If you're looking for your perfect wedding dress, enjoy the search and let yourself be guided while staying true to who you are, so you end up with the haute couture wedding dress that's right for you — whether it's a collection dress or a made-to-measure one at an atelier.",
            "Visit the Fely Campo bridal atelier and let our designer help you dream. Feel the connection with Fely Campo as you find YOUR WEDDING DRESS, alongside a team with years of experience who will guide you and help you live a dream.",
            "Subscribe to our YouTube channel to immerse yourself in the wonderful world of Fely Campo and follow her closely at major events."
          ]
        }
      }
    ]
  },
  {
    "slug": "vestidos-de-novia-los-suenos-se-hacen-realidad",
    "publicado": true,
    "fecha": "2020-06-01",
    "imagenCubierta": "/media/web/img/blog/01-vestidos-de-novia/fely-campo-blog-vestidos-de-novia-portada-1.webp",
    "titulo": {
      "es": "Vestidos de novia: los sueños se hacen realidad",
      "en": "Wedding dresses: dreams come true"
    },
    "resumen": {
      "es": "Presupuesto, calendario, estilos, escotes y colores: la guía completa de Fely Campo para encontrar el vestido de novia con el que siempre has soñado.",
      "en": "Budget, timeline, styles, necklines and colours: Fely Campo's complete guide to finding the wedding dress you've always dreamed of."
    },
    "bloques": [
      {
        "id": "b1",
        "tipo": "texto",
        "texto": {
          "es": [
            "Si al entrar en el espacio de la ceremonia se escucha un suspiro masivo, seguido de un silencio de sorpresa y a continuación resuena entre los invitados la frase \"Parece una princesa\", significa que la novia acertó con la elección de su vestido de novia.",
            "Cuando pensamos en vestidos de novias, por lo general, la primera idea que se nos viene a la mente es un vestido de cuento de hadas, como el de las princesas de las películas de Disney, como una celebrity en un evento de alfombra roja o como las novias de la realeza.",
            "Esta idea no es casual, ya que la mayoría de las nosotras ha crecido con el sueño de vestirse tan especial, al menos una vez en su vida. Pero esa idea muchas veces dista de la realidad.",
            "Si ya tienes a tu persona soñada, es hora de ponerte manos la obra para encontrar tu vestido de novia ideal. Porque tu boda será la ocasión perfecta para lucir un vestido de novia y alcanzar el sueño de ser la protagonista de tu propia historia… con final feliz!"
          ],
          "en": [
            "If walking into the ceremony space draws a collective gasp, followed by a stunned silence and then the words \"She looks like a princess\" ripple through the guests, it means the bride got her wedding dress exactly right.",
            "When we think of wedding dresses, the first image that usually comes to mind is a fairy-tale gown — like a Disney princess, a celebrity on the red carpet, or a royal bride.",
            "That idea is no coincidence: most of us grew up dreaming of dressing that way at least once in our lives. But that dream is often far from reality.",
            "If you've already found your person, it's time to get to work finding your ideal wedding dress. Because your wedding will be the perfect occasion to wear a wedding dress and live out the dream of being the protagonist of your own story… with a happy ending!"
          ]
        }
      },
      {
        "id": "b2",
        "tipo": "subtitulo",
        "texto": {
          "es": "Buscando el vestido de novia perfecto",
          "en": "Finding the perfect wedding dress"
        }
      },
      {
        "id": "b3",
        "tipo": "texto",
        "texto": {
          "es": [
            "Encontrar el vestido de novia perfecto puede ser una tarea muy sencilla o algo más laboriosa.",
            "Muchos son los factores que tendrás que valorar a la hora de escoger entre los mejores vestido de novia: tu gusto personal, el color, el corte y escote que mejor se adapten a tu silueta, el tipo de mangas, si quieres llevar cola, el estilo de la ceremonia, el entorno de la fiesta, el color de la decoración, la fecha de la celebración, el sobre todo, el presupuesto.",
            "Si estás planeando tu boda, te recomendamos que sigas leyendo nuestros apuntes sobre los detalles relevantes a tener en cuenta para que encuentres el vestido de novia con el que tanto has soñado."
          ],
          "en": [
            "Finding the perfect wedding dress can be a very simple task, or a rather more laborious one.",
            "There are many factors you'll need to weigh when choosing among the best wedding dresses: your personal taste, the colour, the cut and neckline that best suit your figure, the sleeve style, whether you want a train, the style of the ceremony, the setting of the party, the colour of the decor, the date of the celebration and, above all, the budget.",
            "If you're planning your wedding, we recommend you keep reading our notes on the details worth considering so you can find the wedding dress you've always dreamed of."
          ]
        }
      },
      {
        "id": "b4",
        "tipo": "subtitulo",
        "texto": {
          "es": "Presupuesto para un vestido de novia",
          "en": "Budget for a wedding dress"
        }
      },
      {
        "id": "b5",
        "tipo": "texto",
        "texto": {
          "es": [
            "Entre los diferentes aspectos que deberás contemplar, se encuentra el precio del vestido.",
            "Gracias a las tradiciones, las bodas terminan siendo una fiesta donde no se escatima en gastos, por esa creencia de que es un evento único y que pasa una sola vez en tu vida. Te aconsejamos que hagas un cálculo global y establezcas un presupuesto para cada partida de los detalles de la boda, incluida la del vestido de novia. Intenta ajustarte a ese presupuesto, ya suele suponer el mayor desembolso de todos los apartados que conllevan la preparación de una boda, por muy sencilla que se quiera organizar.",
            "Es por ello que, hoy día, son varias las soluciones que existen para adquirir vestidos de novias adaptadas a cada bolsillo: alquiler de vestidos de novia, venta de vestidos de novia online, vestidos de novia de segunda mano, vestidos de novia de colección comprados en una tienda de vestidos de novia, vestidos de novia de colección con opciones a modificaciones en un atelier de vestidos de novia de colección, vestidos de novia a medida confeccionados en un atelier de vestidos de novia, vestidos de novia alta costura…",
            "En cuanto a probar vestidos de novia, te recomendamos que no te pruebes los que no te puedas permitir. Evitarás  enamorarte de alguno y que cuando tengas que decidir entre los vestidos que realmente están dentro de ese presupuesto, te cueste no poder quitarte la idea de aquel que no puedes comprarte como referencia. Será entonces más difícil ver alguno que te guste porque sentirás que ninguno te hará sentir tan especial como ese.",
            "Sé consciente de que pueden surgir gastos extra y el vestido de novia podría encarecer (bordados adicionales, cambios en la mangas, añadir un lazo…) Y no olvides el resto de accesorios que te complementarán tu look nupcial: los zapatos, el velo, los adornos para el pelo, la joyería…",
            "Toma nota: por ahorro, por practicidad o por sostenibilidad, cada vez más novias buscan diseños versátiles y reutilizables con los que poder sacarles partido a su vestido de novia en alguna otra ocasión después del enlace."
          ],
          "en": [
            "Among the various things you'll need to consider is the price of the dress.",
            "Thanks to tradition, weddings end up being celebrations where no expense is spared, driven by the belief that it's a once-in-a-lifetime event. We recommend working out an overall figure and setting a budget for each item of the wedding, including the dress. Try to stick to that budget — it tends to be the single biggest expense of the whole wedding, however simple you want it to be.",
            "That's why there are now several ways to get a wedding dress to suit any budget: wedding dress rental, buying online, second-hand wedding dresses, ready-made collection dresses bought from a bridal store, collection dresses with the option of alterations at a bridal atelier, made-to-measure dresses created at a bridal atelier, haute couture wedding dresses…",
            "When it comes to trying on wedding dresses, we recommend you don't try on the ones you can't afford. It will save you from falling for one and then, when you have to decide among the dresses that are actually within your budget, struggling to get that other one out of your head as a reference point. It becomes much harder to find one you like, because you'll feel none of them make you feel as special as that one did.",
            "Keep in mind that extra costs can come up and the price of the dress can rise (additional embroidery, changes to the sleeves, adding a bow…). And don't forget the rest of the accessories that complete your bridal look: the shoes, the veil, the hair accessories, the jewellery…",
            "Take note: whether for the sake of saving money, practicality or sustainability, more and more brides are looking for versatile, reusable designs they can get more wear out of on another occasion after the wedding."
          ]
        }
      },
      {
        "id": "b6",
        "tipo": "subtitulo",
        "texto": {
          "es": "Cuándo empezar a buscar vestido de novia",
          "en": "When to start looking for your wedding dress"
        }
      },
      {
        "id": "b7",
        "tipo": "texto",
        "texto": {
          "es": [
            "Disponer del espacio para el banquete, el envío  de las invitaciones, la elección del destino para la luna de miel… ¿Todo en marcha?. Pues ahora te toca empezar la búsqueda de tu vestido de novia.",
            "Ojear catálogos de vestidos de novia es un hobby que puedes hacer cuando quieras. Pero te recomendamos que comiences a visitar tiendas de vestidos de novia para probarte vestidos cuanto estés preparada para llevar a cabo una compra.",
            "Comprar un vestido de novia es una labor abrumadora, pero no por ello deberías postergar la compra al último momento; podría convertirse en un problema; buscarlo con tiempo puede hacer que el proceso sea muy especial. La antelación ideal para comenzar a ver un vestido de novia y adquirirlo es de cinco a ocho meses antes de la boda."
          ],
          "en": [
            "Venue booked for the reception, invitations sent, honeymoon destination chosen… Is everything underway? Then it's time to start the search for your wedding dress.",
            "Browsing wedding dress catalogues is a hobby you can enjoy whenever you like. But we recommend you start visiting bridal stores to try dresses on once you're ready to actually buy.",
            "Buying a wedding dress is an overwhelming task, but that's no reason to leave it until the last minute — it could become a real problem. Giving yourself enough time can make the process a truly special one. The ideal time to start looking for a wedding dress and buying it is five to eight months before the wedding."
          ]
        }
      },
      {
        "id": "b8",
        "tipo": "subtitulo",
        "texto": {
          "es": "Pide cita previa",
          "en": "Book an appointment in advance"
        }
      },
      {
        "id": "b9",
        "tipo": "texto",
        "texto": {
          "es": [
            "Lo idóneo es que antes de acudir a los diferentes establecimientos a probarte vestidos, conciertes una cita previa. Solo así tendrás la seguridad de que los expertos en la materia podrán atenderte, con la garantía de que lo harán sin prisas. Recuerda que estamos hablando de cómo elegir el vestido de novia perfecto, no de un traje cualquiera."
          ],
          "en": [
            "Ideally, before visiting different stores to try on dresses, you should book an appointment. That way you can be sure the experts will be able to see you, with the guarantee that they'll take their time. Remember, we're talking about choosing the perfect wedding dress here, not just any outfit."
          ]
        }
      },
      {
        "id": "b10",
        "tipo": "subtitulo",
        "texto": {
          "es": "Ve preparada para la prueba",
          "en": "Come prepared for the fitting"
        }
      },
      {
        "id": "b11",
        "tipo": "texto",
        "texto": {
          "es": [
            "Te recomendamos que cuando asistas a probarte distintos vestidos de novia, lo hagas con ropa interior en tonos claros o nude y con un sujetador sin tirantes. En la medida de lo posible, preocúpate por ir con el cabello bien arreglado y maquillada. Lleva contigo unos zapatos de tacón. De este manera te harás una idea más clara de cuál sería el resultado final."
          ],
          "en": [
            "We recommend that whenever you go to try on wedding dresses, you wear light or nude-toned underwear and a strapless bra. As much as possible, make sure your hair is done and you're wearing make-up. Bring a pair of heels with you. This way you'll get a much clearer idea of what the final result will look like."
          ]
        }
      },
      {
        "id": "b12",
        "tipo": "subtitulo",
        "texto": {
          "es": "Asiste acompañada",
          "en": "Bring company"
        }
      },
      {
        "id": "b13",
        "tipo": "texto",
        "texto": {
          "es": [
            "Sin dejarte influenciar demasiado, la opinión de las personas más cercanas y quienes mejor te conozcan, podrán ayudar en esta difícil elección. Por eso es importante elegir la compañía a la hora de acudir tanto a una tienda de vestidos de novia como a un atelier de novias. Además es probable es que tengas que pedir ayuda a quien te haya acompañado a las pruebas de tu vestido de novia para vestirte el día del \"sí, quiero\".",
            "Escucha a tu corazón, evita que te presionen y no compres sin estar del todo convencida. ¡Al final la decisión será tuya!"
          ],
          "en": [
            "Without letting yourself be swayed too much, the opinions of the people closest to you — those who know you best — can help with this difficult decision. That's why it's important to choose who comes with you, whether to a bridal store or a bridal atelier. You'll also likely need help from whoever accompanies you to your fittings when it comes to getting dressed on the day you say \"I do.\"",
            "Listen to your heart, don't let anyone pressure you, and don't buy anything unless you're completely convinced. In the end, the decision is yours!"
          ]
        }
      },
      {
        "id": "b14",
        "tipo": "subtitulo",
        "texto": {
          "es": "Estilos de vestidos de novia",
          "en": "Wedding dress styles"
        }
      },
      {
        "id": "b15",
        "tipo": "texto",
        "texto": {
          "es": [
            "La forma de tu figura, tu tez de piel, tu estatura y tu peso, lo que conforma tu silueta, resultarán concluyentes a la hora de dar con el modelo perfecto para ti. Por eso hay vestidos de novia para personas con mucho busto, vestidos de novia para bajitas, vestidos de novia para mujeres delgadas, vestidos de novia cortos o vestidos de novia en tallas grandes.",
            "Cualquiera que sea tu situación, asegúrate de que el elegido es el que más realza tu figura, tanto en lo que a corte, escote y largo se refiere. Hay tantos tipos de vestidos de novia como cuerpos existen, así que pruébate todos los diseños que haga falta hasta tener claro que ese es \"el vestido\"."
          ],
          "en": [
            "The shape of your figure, your skin tone, your height and your weight — everything that makes up your silhouette — will be decisive in finding the perfect style for you. That's why there are wedding dresses for fuller busts, wedding dresses for petite brides, wedding dresses for slim figures, short wedding dresses, and wedding dresses in plus sizes.",
            "Whatever your situation, make sure the one you choose is the one that flatters your figure the most, in terms of cut, neckline and length alike. There are as many types of wedding dresses as there are bodies, so try on as many designs as it takes until you know that one is \"the dress.\""
          ]
        }
      },
      {
        "id": "b16",
        "tipo": "subtitulo",
        "texto": {
          "es": "Vestidos de novia boho",
          "en": "Boho wedding dresses"
        }
      },
      {
        "id": "b17",
        "tipo": "texto",
        "texto": {
          "es": [
            "Bohemio; este estilo fusiona perfectamente el estilo vintage con el romanticismo. Encajes de ensueño, mangas tres cuarto, faldas fluidas… ¡Feminidad al 500%!"
          ],
          "en": [
            "Bohemian: this style perfectly blends vintage with romance. Dreamy lace, three-quarter sleeves, flowing skirts… femininity at 500%!"
          ]
        }
      },
      {
        "id": "b18",
        "tipo": "foto",
        "src": "/media/web/img/blog/01-vestidos-de-novia/fely-campo-blog-vestidos-de-novia-boho.webp",
        "alt": "Vestido de novia estilo boho",
        "pie": {
          "es": "Vestido de novia estilo boho",
          "en": "Boho-style wedding dress"
        }
      },
      {
        "id": "b19",
        "tipo": "subtitulo",
        "texto": {
          "es": "Vestidos de novia corte sirena",
          "en": "Mermaid-cut wedding dresses"
        }
      },
      {
        "id": "b20",
        "tipo": "texto",
        "texto": {
          "es": [
            "El vestido de novia corte sirena abraza tu figura mientras que la cola de su falda te acompaña a cada paso. Estilo extremadamente sofisticado, que nos recuerda a las célebres actrices sobre la alfombra roja."
          ],
          "en": [
            "The mermaid-cut wedding dress hugs your figure while the train of its skirt follows you with every step. An extremely sophisticated style, reminiscent of famous actresses on the red carpet."
          ]
        }
      },
      {
        "id": "b21",
        "tipo": "subtitulo",
        "texto": {
          "es": "Vestidos de novia corte princesa",
          "en": "Princess-cut wedding dresses"
        }
      },
      {
        "id": "b22",
        "tipo": "texto",
        "texto": {
          "es": [
            "Con aires de cuento de hadas, se caracteriza por tener una diferencia muy marcada entre la cintura estrecha y la falda amplia, es ideal para aquellas mujeres que quieran disimular la zona de la cadera y remarcar su cintura."
          ],
          "en": [
            "With a fairy-tale feel, this style is defined by a sharp contrast between a narrow waist and a full skirt — ideal for women who want to downplay the hip area and emphasise the waist."
          ]
        }
      },
      {
        "id": "b23",
        "tipo": "subtitulo",
        "texto": {
          "es": "Vestidos de novia corte A",
          "en": "A-line wedding dresses"
        }
      },
      {
        "id": "b24",
        "tipo": "texto",
        "texto": {
          "es": [
            "Podría confundirse con el corte princesa. La diferencia de los vestidos de novia de corte A, es que en este corte, se forma una línea triángulo que se abre desde la zona de la cintura hasta el filo del vestido."
          ],
          "en": [
            "It could be mistaken for the princess cut. The difference with A-line wedding dresses is that this cut forms a triangular line that opens out from the waist down to the hem of the dress."
          ]
        }
      },
      {
        "id": "b25",
        "tipo": "foto",
        "src": "/media/web/img/blog/01-vestidos-de-novia/fely-campo-blog-vestidos-de-novia-corte-a-1.webp",
        "alt": "Vestidos de novia corte A. Colección Metaphysics",
        "pie": {
          "es": "Vestidos de novia corte A. Colección Metaphysics.",
          "en": "A-line wedding dresses. Metaphysics collection."
        }
      },
      {
        "id": "b26",
        "tipo": "subtitulo",
        "texto": {
          "es": "Vestidos de novia corte imperio",
          "en": "Empire-line wedding dresses"
        }
      },
      {
        "id": "b27",
        "tipo": "texto",
        "texto": {
          "es": [
            "Para un look elegante, con un toque de ingenuidad el día de tu boda. El corte imperio empieza justo debajo de la línea del busto y la falda baja suelta y vaporosa. Cómodo y romántico. Admite varios tipos de escote."
          ],
          "en": [
            "For an elegant look with a touch of ingenuousness on your wedding day. The empire line starts just below the bust, with the skirt falling loose and flowing from there. Comfortable and romantic, it works with several types of neckline."
          ]
        }
      },
      {
        "id": "b28",
        "tipo": "foto",
        "src": "/media/web/img/blog/01-vestidos-de-novia/fely-campo-blog-vestidos-de-novia-corte-imperio.webp",
        "alt": "Vestidos de novia corte imperio de la Colección Celebration de Fely Campo",
        "pie": {
          "es": "Vestidos de novia corte imperio de la Colección Celebration de Fely Campo.",
          "en": "Empire-line wedding dresses from Fely Campo's Celebration collection."
        }
      },
      {
        "id": "b29",
        "tipo": "subtitulo",
        "texto": {
          "es": "Vestidos de novia corte griego",
          "en": "Grecian-cut wedding dresses"
        }
      },
      {
        "id": "b30",
        "tipo": "texto",
        "texto": {
          "es": [
            "Camina hacia el altar sintiéndote como una diosa con tu vestido de novia de estilo griego, que destacará tu pecho y alargará visualmente más tu figura respecto a otros modelos."
          ],
          "en": [
            "Walk down the aisle feeling like a goddess in a Grecian-style wedding dress, which will flatter your bust and visually elongate your figure more than other styles."
          ]
        }
      },
      {
        "id": "b31",
        "tipo": "foto",
        "src": "/media/web/img/blog/01-vestidos-de-novia/fely-campo-blog-vestidos-de-novia-corte-griego.webp",
        "alt": "Vestido de novia con corte griego. Colección Lines",
        "pie": {
          "es": "Vestido de novia con corte griego. Colección Lines.",
          "en": "Grecian-cut wedding dress. Lines collection."
        }
      },
      {
        "id": "b32",
        "tipo": "texto",
        "texto": {
          "es": [
            "Cuando leas nuestro post \"La elección del vestido de novia entre las nuevas colecciones de novia\" podrás añadir estilos de vestidos de novia a tu lista de opciones."
          ],
          "en": [
            "When you read our post \"Choosing your wedding dress among the new bridal collections,\" you'll be able to add even more wedding dress styles to your list of options."
          ]
        }
      },
      {
        "id": "b33",
        "tipo": "subtitulo",
        "texto": {
          "es": "Tipos de escote para un vestido de novia",
          "en": "Wedding dress neckline types"
        }
      },
      {
        "id": "b34",
        "tipo": "texto",
        "texto": {
          "es": [
            "El escote, un buen aliado para acentuar o disimular lo que se desee en cada caso. Servirá tanto para afinar tus brazos, destacar tu cuello, realzar el pecho… como para enseñar unos hombros bonitos, lucir piernas esbeltas o mostrar un tatuaje.",
            "Aquí te mencionamos algunos de los escotes de vestidos de novia más habituales para facilitarte la elección. ¡Encuentra el tuyo!"
          ],
          "en": [
            "The neckline is a great ally for playing up or playing down whatever you want in each case. It can slim your arms, draw attention to your neck, flatter your bust… just as it can show off pretty shoulders, slender legs or a tattoo.",
            "Here we cover some of the most common wedding dress necklines to help you choose. Find yours!"
          ]
        }
      },
      {
        "id": "b35",
        "tipo": "subtitulo",
        "texto": {
          "es": "Vestidos de novia palabra de honor",
          "en": "Strapless straight-neckline wedding dresses"
        }
      },
      {
        "id": "b36",
        "tipo": "texto",
        "texto": {
          "es": [
            "Es un escote que favorece a casi todas las novias porque realza el pecho, alarga el cuello y destaca tus hombros. Está entre los escotes para vestidos de novia más escogidos en cualquier temporada."
          ],
          "en": [
            "It's a neckline that flatters almost every bride, since it lifts the bust, lengthens the neck and shows off the shoulders. It's one of the most popular wedding dress necklines in any season."
          ]
        }
      },
      {
        "id": "b37",
        "tipo": "foto",
        "src": "/media/web/img/blog/01-vestidos-de-novia/fely-campo-blog-vestidos-de-novia-palabra-honor.webp",
        "alt": "Vestido de novia con escote palabra de honor. Colección Etéreo",
        "pie": {
          "es": "Vestido de novia con escote palabra de honor. Colección Etéreo.",
          "en": "Strapless straight-neckline wedding dress. Etéreo collection."
        }
      },
      {
        "id": "b38",
        "tipo": "subtitulo",
        "texto": {
          "es": "Vestidos de novia cuello halter",
          "en": "Halter-neck wedding dresses"
        }
      },
      {
        "id": "b39",
        "tipo": "texto",
        "texto": {
          "es": [
            "Los vestidos de novia cuello halter se abrochan siempre detrás del cuello, dejando los hombros, los brazos y parte de la espalda al descubierto. Ideal para mujeres con mucho pecho y para quien quiera lucir sensual en su gran día."
          ],
          "en": [
            "Halter-neck wedding dresses always fasten behind the neck, leaving the shoulders, arms and part of the back bare. Ideal for women with a fuller bust and for anyone who wants to look sensual on their big day."
          ]
        }
      },
      {
        "id": "b40",
        "tipo": "foto",
        "src": "/media/web/img/blog/01-vestidos-de-novia/fely-campo-blog-vestidos-de-novia-cuello-halter-1.webp",
        "alt": "Vestido de novia cuello halter. Atelier de novias de Fely Campo",
        "pie": {
          "es": "Vestido de novia cuello halter. Atelier de novias de Fely Campo.",
          "en": "Halter-neck wedding dress. Fely Campo bridal atelier."
        }
      },
      {
        "id": "b41",
        "tipo": "subtitulo",
        "texto": {
          "es": "Vestidos de novia escote corazón",
          "en": "Sweetheart-neckline wedding dresses"
        }
      },
      {
        "id": "b42",
        "tipo": "texto",
        "texto": {
          "es": [
            "Este tipo de escote resulta especialmente romántico y femenino. Muy similar al palabra de honor, pero con forma de corazón, en vez de recto como en anterior. La versatilidad de los vestidos de novia escote corazón radica en que realza el pecho pequeño y destaca el grande."
          ],
          "en": [
            "This type of neckline is especially romantic and feminine. Very similar to the strapless straight neckline, but heart-shaped rather than straight across. The versatility of the sweetheart neckline lies in the fact that it lifts a smaller bust and flatters a fuller one alike."
          ]
        }
      },
      {
        "id": "b43",
        "tipo": "foto",
        "src": "/media/web/img/blog/01-vestidos-de-novia/fely-campo-blog-vestidos-de-novia-escote-corazon-introspeccion.webp",
        "alt": "Vestido de novia con escote corazón. Colección Introspección",
        "pie": {
          "es": "Vestido de novia con escote corazón. Colección Introspección.",
          "en": "Sweetheart-neckline wedding dress. Introspección collection."
        }
      },
      {
        "id": "b44",
        "tipo": "subtitulo",
        "texto": {
          "es": "Vestidos de novia cuello alto (o tipo cisne)",
          "en": "High-neck (swan-neck) wedding dresses"
        }
      },
      {
        "id": "b45",
        "tipo": "texto",
        "texto": {
          "es": [
            "Alargarás tu cuello y lucirás muy esbelta si eliges un vestido de novia cuello alto. Son los favoritos para los meses más fríos del año, aunque también se llevan en primavera dejando los hombros al descubierto."
          ],
          "en": [
            "You'll lengthen your neck and look wonderfully slender if you choose a high-neck wedding dress. It's a favourite for the colder months of the year, though it's also worn in spring, leaving the shoulders bare."
          ]
        }
      },
      {
        "id": "b46",
        "tipo": "foto",
        "src": "/media/web/img/blog/01-vestidos-de-novia/fely-campo-blog-vestidos-de-novia-cuello-alto-cuello-tipo-cisne.webp",
        "alt": "Vestido de novia con cuello alto de la Colección Lines de Fely Campo",
        "pie": {
          "es": "Vestido de novia con cuello alto de la Colección Lines de Fely Campo.",
          "en": "High-neck wedding dress from Fely Campo's Lines collection."
        }
      },
      {
        "id": "b47",
        "tipo": "subtitulo",
        "texto": {
          "es": "Vestidos de novia cuello barco",
          "en": "Boat-neck wedding dresses"
        }
      },
      {
        "id": "b48",
        "tipo": "texto",
        "texto": {
          "es": [
            "Se distingue porque traza una línea simétrica que va de hombro a hombro. El escote cuello barco deja las clavículas al descubierto, lo que te aportará sensualidad. Las novias con el cuello corto, silueta recta y o caderas un poco anchas, sin duda se verán especialmente favorecidas con vestido de novia de cuello barco."
          ],
          "en": [
            "It stands out for its symmetrical line running from shoulder to shoulder. The boat neckline leaves the collarbones on show, adding a touch of sensuality. Brides with a short neck, a straight silhouette or slightly wide hips will look especially flattered in a boat-neck wedding dress."
          ]
        }
      },
      {
        "id": "b49",
        "tipo": "subtitulo",
        "texto": {
          "es": "Vestidos de novia de colores",
          "en": "Coloured wedding dresses"
        }
      },
      {
        "id": "b50",
        "tipo": "texto",
        "texto": {
          "es": [
            "Toda mujer ha soñado con casarse vestida de blanco. Y es que, ya desde los años 1400, las damas de la realeza utilizaban vestidos de novia blancos. Y aunque han ido evolucionando con toques de brillo,  el blanco era el color que prevalecía para las bodas. Desde entonces se dice que el blanco simboliza la pureza e inocencia propios de una novia.",
            "De ahí que por tradición  el blanco se ha convertido en el color con más presencia en las colecciones de vestidos de novia hasta la actualidad.",
            "Pero en los tiempos que corren, la tendencia es innovar y qué mejor momento para ello que el día de tu boda con tu vestido de novia. En las pasarelas nupciales, los diseñadores arriesgan con vestidos de novia de colores distintos al blanco, como los rosas, los grises, toques más arriesgados de colores vibrantes…y aciertan!",
            "Antes de que se usara el vestido de novia blanco como símbolo de la pureza, se usaban vestidos de novia de colores y cada uno representaba una situación diferente, según las supersticiones de algunos países."
          ],
          "en": [
            "Every woman has dreamed of getting married in white. As far back as the 1400s, royal ladies wore white wedding dresses. And although they've evolved to include touches of shimmer, white remained the prevailing colour for weddings. Since then, white is said to symbolise the purity and innocence associated with a bride.",
            "That's why, by tradition, white has become the most common colour in wedding dress collections right up to today.",
            "But these days, the trend is to innovate, and what better moment to do so than your wedding day, with your wedding dress. On bridal runways, designers are taking risks with wedding dresses in colours other than white — pinks, greys, bolder touches of vibrant colour… and getting it right!",
            "Before the white wedding dress became a symbol of purity, coloured wedding dresses were worn, each one representing a different meaning, according to the superstitions of certain countries."
          ]
        }
      },
      {
        "id": "b51",
        "tipo": "foto",
        "src": "/media/web/img/blog/01-vestidos-de-novia/fely-campo-blog-vestidos-de-novia-colores.webp",
        "alt": "Vestidos de novias de colores en Valmont Barcelona Bridal Fashion Week",
        "pie": {
          "es": "Vestidos de novias de colores en Valmont Barcelona Bridal Fashion Week.",
          "en": "Coloured wedding dresses at Valmont Barcelona Bridal Fashion Week."
        }
      },
      {
        "id": "b52",
        "tipo": "texto",
        "texto": {
          "es": [
            "Por ejemplo, si la novia usaba un vestido de novia azul, significaba que el amor siempre iba a ser verdadero; en amarillo, significaba sentir pena por quien la desposaba; en perla, significaba que viviría un remolino de sentimientos.",
            "Teniendo el tiempo suficiente para la elección, te recomendamos que te pruebes vestidos de novia rosa, vestidos de novia champagne, vestidos de novia negro o vestidos de novia color ivory (marfil). No habrá otra ocasión similar a esta para que experimentes con tus preferencias y el color de tu piel. Que el color de tu vestido de novia refleje tu personalidad. Con cualquiera que escojas, deslumbrarás!"
          ],
          "en": [
            "For example, if a bride wore a blue dress, it meant love would always be true; in yellow, it meant feeling sorry for whoever married her; in pearl, it meant she would live through a whirlwind of emotions.",
            "With enough time to choose, we recommend trying on pink wedding dresses, champagne wedding dresses, black wedding dresses or ivory wedding dresses. There won't be another occasion quite like this one to experiment with your preferences and your skin tone. Let the colour of your wedding dress reflect your personality. Whichever you choose, you'll dazzle!"
          ]
        }
      },
      {
        "id": "b53",
        "tipo": "subtitulo",
        "texto": {
          "es": "Vestidos de novia alta costura",
          "en": "Haute couture wedding dresses"
        }
      },
      {
        "id": "b54",
        "tipo": "texto",
        "texto": {
          "es": [
            "¡Por fin has llegado al apartado más importante de todos!: al de la elección de un taller de moda para la confección de tu vestido de novia. Naturalmente esta es la alternativa más apropiada para convertir la engorrosa labor de encontrar tu vestido de novia en un recuerdo entrañable.",
            "Tan importante como acudir acompañada a las pruebas por personas de confianza a la compra del vestido, es que te dejes aconsejar por profesionales. Quizá tengas claro qué estilo de vestido de novia es el más indicado para ti, pero no estará de más que escuches sus consejos y te dejes asesorar. Recuerda que ellos son especialistas en mimos, conexión y comprensión. Sabrán cómo dar con lo que quieres, lo que esperas y lo que obtendrás de tu vestido de novia.",
            "Pide aquí tu cita, sin prisas pero con antelación. La diseñadora Fely Campo te hará vivir la experiencia de que te elaboren un vestido de novia de alta costura y a medida o te asesorará en la búsqueda de un vestido de colección y las modificaciones que puedes hacerle. Una esmerada y personalizada atención te esperan en nuestros ateliers de moda de Salamanca u Oviedo.",
            "¡Despierta, es real, tendrás el vestido de novia perfecto! Saldrás de nuestro atelier de moda brillando como la princesa que siempre soñaste ser!"
          ],
          "en": [
            "You've finally reached the most important section of all: choosing a fashion atelier to create your wedding dress. This is naturally the best way to turn the sometimes tiresome task of finding your wedding dress into a cherished memory.",
            "Just as important as bringing people you trust to your fittings is letting yourself be guided by professionals. You might already know exactly which style of wedding dress suits you best, but it never hurts to listen to their advice and let them guide you. Remember, they're specialists in care, connection and understanding. They'll know how to find what you want, what you expect, and what you'll get from your wedding dress.",
            "Book your appointment here — no rush, but with enough notice. Designer Fely Campo will give you the experience of having a made-to-measure haute couture wedding dress created for you, or will advise you in your search for a collection dress and the alterations you can make to it. Attentive, personalised care awaits you at our fashion ateliers in Salamanca and Oviedo.",
            "Wake up — it's real, you'll have the perfect wedding dress! You'll walk out of our fashion atelier shining like the princess you always dreamed of being!"
          ]
        }
      }
    ]
  },
  {
    "slug": "vestidos-de-madrina",
    "publicado": true,
    "fecha": "2021-10-15",
    "imagenCubierta": "/media/web/img/blog/02-vestidos-de-madrina/fely-campo-blog-vestidos-de-madrina-portada-vestido-1.webp",
    "titulo": {
      "es": "Vestidos de madrina: la búsqueda de la elegancia con personalidad",
      "en": "Madrina dresses: the search for elegance with personality"
    },
    "resumen": {
      "es": "Protocolo, largos, colores, mantillas y abrigos: la guía de Fely Campo para que la madrina y la madre de la novia encuentren su vestido ideal sin eclipsar a la novia.",
      "en": "Protocol, hemlines, colours, mantillas and coats: Fely Campo's guide for the madrina and the mother of the bride to find their ideal dress without upstaging the bride."
    },
    "bloques": [
      {
        "id": "b1",
        "tipo": "texto",
        "texto": {
          "es": [
            "La madrina, junto a la madre de la novia, es una de las protagonistas de la boda y un pilar esencial para los novios. Después de la novia, se convierte en la mujer más observada de la ceremonia, ya que es la encargada de acompañar al novio, tanto en una boda religiosa como en una civil.",
            "A continuación podrás encontrar una guía para responder a las grandes preguntas de cómo ser la madrina ideal."
          ],
          "en": [
            "The madrina — traditionally the groom's escort, often his mother — is, along with the mother of the bride, one of the leading figures of the wedding and an essential pillar for the couple. After the bride, she becomes the most watched woman at the ceremony, since she is the one who walks the groom down the aisle, in both religious and civil weddings.",
            "Below you'll find a guide answering the big questions on how to be the ideal madrina."
          ]
        }
      },
      {
        "id": "b2",
        "tipo": "subtitulo",
        "texto": {
          "es": "Cómo debe vestir la madrina de una boda",
          "en": "How the madrina of a wedding should dress"
        }
      },
      {
        "id": "b3",
        "tipo": "texto",
        "texto": {
          "es": [
            "Cuando los novios anuncian la fecha de la boda, tras la emoción y las felicitaciones, y cuando la madre del novio tiene su momento de pensar en su papel como madrina en esa boda, y no puede evitar preguntarse cómo debe ir vestida la madrina de una boda.",
            "Es cierto que hay unas ciertas reglas de protocolo, pero no debes olvidar que si eres la madrina, después de la novia, tu vestido será el que más miradas atraiga y lo principal es que sin eclipsar a la novia, seas fiel a ti misma, a tu manera de vestir en el día a día, que seas tú quien lleva el vestido y no el vestido el que te lleva a ti. La mayoría de las madrinas sueñan con un elegante vestido de madrina para acompañar a su hijo o familiar hacia el altar el día de su boda y en este post te vamos a dar unos tips para que la búsqueda de tu look te resulte una experiencia emocionante, que te haga sentir cómoda formando parte de uno de los días más importantes en la vida de los novios."
          ],
          "en": [
            "When the couple announce the wedding date, after the excitement and the congratulations, the groom's mother has her moment to think about her role as madrina at that wedding — and she can't help wondering how the madrina of a wedding should dress.",
            "It's true there are certain rules of protocol, but don't forget that if you're the madrina, your dress will be the one that draws the most attention after the bride's, and the main thing is that — without upstaging the bride — you stay true to yourself and to the way you dress day to day: you should wear the dress, not have the dress wear you. Most madrinas dream of an elegant dress to walk their son or family member down the aisle on their wedding day, and in this post we'll give you some tips to make the search for your look an exciting experience, one that makes you feel comfortable being part of one of the most important days in the couple's life."
          ]
        }
      },
      {
        "id": "b4",
        "tipo": "subtitulo",
        "texto": {
          "es": "Protocolo de los vestidos para madrina",
          "en": "Protocol for madrina dresses"
        }
      },
      {
        "id": "b5",
        "tipo": "texto",
        "texto": {
          "es": [
            "El protagonismo de la boda lo tienen los novios, y como la madrina es una de las personas queridas que más les acompañará, la elección de su estilismo debe tener en cuenta sus preferencias.",
            "Normalmente la novia y el novio planean la boda y eligen sus estilismos en base a sus gustos y lo que han soñado para ese día tan especial y son las madrinas y las madres de las novias quienes les acompañan muy de cerca. Son las personas que viven el día de los novios con tanta ilusión como si fuera el suyo propio, pero manteniéndose en un segundo plano y buscando la perfección en el día de sus hijos.",
            "Su vestido de madrina debe ir acorde al de la novia sin sobrepasarla ni eclipsarla. Si la novia lleva cola, lo ideal es que la madrina también, pero en menos medida."
          ],
          "en": [
            "The wedding belongs to the couple, and since the madrina is one of the loved ones who will be closest to them throughout, choosing her look should take their preferences into account.",
            "Usually the bride and groom plan the wedding and choose their looks based on their own taste and what they've dreamed of for that special day, and it's the madrinas and the mothers of the brides who accompany them most closely. They experience the couple's day with as much excitement as if it were their own, while staying in the background and striving for perfection on their children's big day.",
            "Her madrina dress should be in keeping with the bride's, without outdoing or upstaging her. If the bride wears a train, ideally the madrina should too, but a shorter one."
          ]
        }
      },
      {
        "id": "b6",
        "tipo": "subtitulo",
        "texto": {
          "es": "El largo del vestido de madrina",
          "en": "The length of the madrina dress"
        }
      },
      {
        "id": "b7",
        "tipo": "texto",
        "texto": {
          "es": [
            "En cuanto al largo del vestido, en caso de que la novia se haya vestido con un vestido largo, la madrina puede ir tanto de largo como de corto, no importa si la boda es de mañana o de tarde. De hecho la madrina es la única invitada, que según el protocolo más estricto, puede llevar un vestido largo aunque la boda sea de día. Los demás invitados, incluida la madre de la novia, deberán llevar como mucho un largo midi. Eso sí, lo aconsejable es que el corte del vestido no esté nunca por encima de la rodilla."
          ],
          "en": [
            "As for the length of the dress, if the bride is wearing a long gown, the madrina can go either long or short — it doesn't matter whether the wedding is in the morning or the afternoon. In fact, according to the strictest protocol, the madrina is the only guest allowed to wear a long dress even for a daytime wedding. Every other guest, including the mother of the bride, should wear a midi length at most. That said, it's best if the hemline never sits above the knee."
          ]
        }
      },
      {
        "id": "b8",
        "tipo": "foto",
        "src": "/media/web/img/blog/02-vestidos-de-madrina/fely-campo-blog-vestidos-de-madrina-vestido-2.webp",
        "alt": "Vestido de madrina largo en un jardín",
        "pie": {
          "es": "Vestido de madrina de largo completo.",
          "en": "A full-length madrina dress."
        }
      },
      {
        "id": "b9",
        "tipo": "subtitulo",
        "texto": {
          "es": "Colores de vestidos de madrina",
          "en": "Colours for madrina dresses"
        }
      },
      {
        "id": "b10",
        "tipo": "texto",
        "texto": {
          "es": [
            "Los colores en un vestido de madrina son muy amplios. Por supuesto los blancos están reservados para la novia y no debe llevarlos para no eclipsarla. Antes las madrinas solían utilizar tonos empolvados, pero como vimos en algún post anterior sobre vestidos de novia, ellas cada vez son más atrevidas y muchas veces no solo van de blanco, sino que los rosas, platas, marfiles o grises también son colores de la novia. Lo mejor es que una vez que la novia ha elegido su vestido, le comente a la madrina qué colores quedan reservados para ella.",
            "Hay colores que son una apuesta segura de elegancia, como el azul marino, los verdes o los corales. Los tonos empolvados, como el verde agua, los rosas, etc., son muy utilizados desde siempre. Y por supuesto los rojos y los tonos frambuesas son de los favoritos para las madrinas tanto en bodas de día como de noche."
          ],
          "en": [
            "The colour options for a madrina dress are very wide-ranging. White, of course, is reserved for the bride, and the madrina shouldn't wear it so as not to upstage her. Madrinas used to favour powdery, muted tones, but as we saw in an earlier post about wedding dresses, brides are getting bolder — often they no longer wear only white, and pinks, silvers, ivories or greys can also be bridal colours. It's best that, once the bride has chosen her dress, she lets the madrina know which colours are off-limits for her.",
            "Some colours are always a safe bet for elegance, such as navy blue, greens or corals. Powdery tones like seafoam green and pinks have always been popular. And of course, reds and raspberry tones are among the favourites for madrinas, for both daytime and evening weddings."
          ]
        }
      },
      {
        "id": "b11",
        "tipo": "foto",
        "src": "/media/web/img/blog/02-vestidos-de-madrina/fely-campo-blog-vestidos-de-madrina-vestido.webp",
        "alt": "Vestido de madrina en un tono azul empolvado con encaje",
        "pie": {
          "es": "Vestido de madrina en un tono empolvado.",
          "en": "A madrina dress in a powdery tone."
        }
      },
      {
        "id": "b12",
        "tipo": "texto",
        "texto": {
          "es": [
            "Casi siempre, el negro o los colores muy oscuros han estado vetados en este tipo de eventos, pero en la actualidad esta parte del protocolo se comienza a evitar en muchas bodas. De hecho en las ceremonias de noche, el negro puede ser un color tremendamente elegante y perfecto para lucir por la madrina, siempre y cuando ella sienta guapa y segura con él y la novia también.",
            "Lo importante es que la madrina se encuentre cómoda y comente con los novios cuales son los colores que le hacen sentir así. Puede ayudar mucho que los novios acompañen a la madrina en su elección, para que entiendan cómo el color favorece su personalidad y hace que ella se sienta cómoda y hermosa."
          ],
          "en": [
            "Black or very dark colours have almost always been off-limits at this kind of event, but nowadays this part of the protocol is starting to be set aside at many weddings. In fact, for evening ceremonies, black can be a tremendously elegant colour, perfect for the madrina to wear, as long as she feels beautiful and confident in it — and the bride is comfortable with it too.",
            "What matters most is that the madrina feels comfortable, and that she talks with the couple about which colours make her feel that way. It can help a great deal if the couple go along with the madrina during her search, so they understand how a colour flatters her personality and helps her feel comfortable and beautiful."
          ]
        }
      },
      {
        "id": "b13",
        "tipo": "subtitulo",
        "texto": {
          "es": "Vestidos de madrina con mantilla para la boda",
          "en": "Madrina dresses with a mantilla for the wedding"
        }
      },
      {
        "id": "b14",
        "tipo": "texto",
        "texto": {
          "es": [
            "Otro de los temas a tener en cuenta son las madrinas con mantilla. La decisión de llevar mantilla suele ser un deseo personal de la madrina, pero también de los novios. Y por supuesto, inevitablemente, condiciona el traje y los complementos que llevará la madrina.",
            "Suelen llevarse en ceremonias muy formales y en este caso sí que deben llevarse con un vestido de madrina largo, aunque cada vez son más las madrinas que lo llevan también con un vestido de corte midi.",
            "La mantilla cobrará mucho protagonismo, por ello el vestido y todo el estilismo de la madrina deberá compensarse siendo de lo más sencillo, evitando los artificios. Esto convertirá el estilismo de la madrina en un desfile de elegancia absoluta."
          ],
          "en": [
            "Another thing to consider is madrinas wearing a mantilla. The decision to wear one is usually a personal wish of the madrina's, but sometimes the couple's too. And naturally, it inevitably shapes the outfit and accessories the madrina will wear.",
            "Mantillas are usually worn at very formal ceremonies, and in that case they should indeed be paired with a long madrina dress — although more and more madrinas are now wearing them with a midi-length dress too.",
            "The mantilla will take on a lot of visual weight, so the dress and the rest of the madrina's look should stay as simple as possible, avoiding anything overly elaborate, to balance it out. This will turn the madrina's look into an absolute parade of elegance."
          ]
        }
      },
      {
        "id": "b15",
        "tipo": "foto",
        "src": "/media/web/img/blog/02-vestidos-de-madrina/fely-campo-blog-vestidos-de-madrina-mantilla-boda.webp",
        "alt": "Look de madrina con tocado de ala ancha",
        "pie": {
          "es": "Un look de madrina con tocado de ala ancha.",
          "en": "A madrina look with a wide-brim hat."
        }
      },
      {
        "id": "b16",
        "tipo": "subtitulo",
        "texto": {
          "es": "Vestidos de madrina de otoño y de invierno",
          "en": "Autumn and winter madrina dresses"
        }
      },
      {
        "id": "b17",
        "tipo": "texto",
        "texto": {
          "es": [
            "Es cierto que la mayoría de las celebraciones se centra en los meses que van desde abril, incluso marzo, hasta septiembre. Sin embargo desde la situación que hemos vivido recientemente, este año los eventos han dado el protagonismo al otoño y al invierno. Por ello los vestidos de madrina en 2021 más buscados han sido los que se adaptan a las épocas de invierno y otoño.",
            "Muchos novios decidieron posponer su boda para esta época y muchas firmas han adaptado sus colecciones de novias para ello. Los trajes con segundas piezas han hecho que muchos de los vestidos de madrina sean espectaculares. Las tendencias en vestidos de madrina en esta época son otras: los tejidos son más gruesos, los colores algo más oscuros, pero por supuesto los diseñadores de vestidos de madrina han hecho propuestas que no perdían un ápice de la alegría que caracteriza los vestidos de esta época."
          ],
          "en": [
            "It's true that most celebrations are concentrated in the months from April, or even March, through to September. However, because of what we've all recently been through, this year's events have given autumn and winter their moment in the spotlight. That's why the most sought-after madrina dresses in 2021 have been the ones suited to the colder months.",
            "Many couples decided to postpone their wedding to this time of year, and many brands adapted their bridal collections accordingly. Outfits with a second piece have made many madrina dresses truly spectacular. Trends for madrina dresses in this season are different: the fabrics are heavier, the colours a little darker, but of course designers have still come up with proposals that lose none of the joyfulness that characterises dresses for this time of year."
          ]
        }
      },
      {
        "id": "b18",
        "tipo": "foto",
        "src": "/media/web/img/blog/02-vestidos-de-madrina/fely-campo-blog-vestidos-de-madrina-savia-look-19-2.webp",
        "alt": "Conjunto de madrina en terciopelo azul noche, colección Savia",
        "pie": {
          "es": "Conjunto de madrina en terciopelo, colección Savia.",
          "en": "A velvet madrina two-piece, Savia collection."
        }
      },
      {
        "id": "b19",
        "tipo": "texto",
        "texto": {
          "es": [
            "Los vestidos con abrigo de madrina en brocados estampados o colores atrevidos, los trajes de varias piezas que se adaptan a esta época con chaquetas en elegantes terciopelos, el juego de los estilismos con estolas, son algunas de las propuestas de las marcas de vestidos de madrina que pueden hacer tu estilismo más divertido y sorprendente."
          ],
          "en": [
            "Madrina dresses paired with a coat in printed brocade or bold colours, multi-piece outfits suited to this season with elegant velvet jackets, and looks styled with stoles are some of the ideas from madrina dress brands that can make your look more fun and surprising."
          ]
        }
      },
      {
        "id": "b20",
        "tipo": "foto",
        "src": "/media/web/img/blog/02-vestidos-de-madrina/fely-campo-blog-vestidos-de-madrina-savia-look-7-2.webp",
        "alt": "Abrigo rojo de madrina sobre vestido estampado, colección Savia",
        "pie": {
          "es": "Abrigo de madrina en rojo sobre vestido estampado, colección Savia.",
          "en": "A red madrina coat over a printed dress, Savia collection."
        }
      },
      {
        "id": "b21",
        "tipo": "texto",
        "texto": {
          "es": [
            "De hecho, una de las prendas que más le gusta a nuestra diseñadora son los abrigos, ya que son una pieza que acompaña al estilismo y puede convertir el vestido de madrina más elegante si cabe; aporta seguridad a la mujer que lo lleva, la acompaña. Las segundas piezas son una apuesta segura para sorprender, ya que se convierten en una manera de tener dos estilismos durante la ceremonia."
          ],
          "en": [
            "In fact, coats are one of our designer's favourite pieces, since they're a garment that completes the look and can make a madrina dress even more elegant; they give the woman wearing it confidence — they accompany her. Second pieces are a safe bet if you want to surprise, since they let you get two looks out of one outfit during the ceremony."
          ]
        }
      },
      {
        "id": "b22",
        "tipo": "subtitulo",
        "texto": {
          "es": "La madre de la novia",
          "en": "The mother of the bride"
        }
      },
      {
        "id": "b23",
        "tipo": "texto",
        "texto": {
          "es": [
            "Por supuesto la madre de la novia es otra de las grandes protagonistas de este día tan especial. Todas ellas buscan estar a la altura de la celebración, acompañar a sus hijas en todo momento y ayudarlas junto a la madrina para que todo sea como la pareja siempre han soñado su día.",
            "Como la madrina de la boda, los colores no deben eclipsar a los de la novia. También tiene que tener en cuenta la elección que ha hecho la madrina en cuanto a colores, estilo, etc., para no coincidir. Y en las ceremonias más protocolarias, si la ceremonia es de día, no debe llevar vestido largo; pero como ya hemos mencionado anteriormente, este tipo de protocolos en cuanto a los largos de los vestidos y detalles así, está perdiendo importancia."
          ],
          "en": [
            "The mother of the bride is, of course, another of the leading figures on this special day. Every mother wants to rise to the occasion, be by her daughter's side at all times, and help her — together with the madrina — so that everything is exactly how the couple always dreamed their day would be.",
            "Like the madrina, her colours shouldn't upstage the bride's. She also needs to take into account the choices the madrina has made in terms of colour, style and so on, to avoid clashing or repeating them. And at more formal, protocol-driven ceremonies, if the wedding is during the day, she shouldn't wear a long dress — although, as we've already mentioned, this kind of protocol around dress lengths and similar details is becoming less important."
          ]
        }
      },
      {
        "id": "b24",
        "tipo": "foto",
        "src": "/media/web/img/blog/02-vestidos-de-madrina/fely-campo-blog-vestidos-de-madrina-madre-novia.webp",
        "alt": "La madre de la novia junto a la novia el día de la boda",
        "pie": {
          "es": "La madre de la novia, el día de la boda.",
          "en": "The mother of the bride, on the wedding day."
        }
      },
      {
        "id": "b25",
        "tipo": "subtitulo",
        "texto": {
          "es": "El Atelier de la Madrina y la Madre de Novia",
          "en": "The Madrina and Mother-of-the-Bride Atelier"
        }
      },
      {
        "id": "b26",
        "tipo": "texto",
        "texto": {
          "es": [
            "En definitiva, la búsqueda del vestido de la madrina y de la madre de la novia, es otro de los momentos especiales y emocionantes que se dan en los preparativos de la ceremonia. Por lo que el lugar en el que decidan realizar su vestido es tremendamente importante; el hecho de sentirse comprendidas en todo momento, escuchadas y aconsejadas es muy importante para que se sientan cómodas. No se trata solo de encontrar un vestido bonito, sino de la experiencia de encontrarlo.",
            "Desde los Ateliers de Fely Campo, especializados en colecciones de fiesta, buscamos conocer a las madrinas y a las madres de las novias; conocer el tipo de ceremonia y sus gustos es parte del proceso. Trasladamos la filosofía de nuestra diseñadora a nuestras tiendas de Oviedo y Salamanca: \"Me gusta conocer a la mujer que voy a vestir, no disfrazarla\"."
          ],
          "en": [
            "Ultimately, the search for the madrina's dress and the mother of the bride's dress is another of the special, exciting moments in the run-up to the ceremony. That's why where they decide to have their dress made matters enormously; feeling understood, listened to and well advised at every step is essential for them to feel comfortable. It's not just about finding a beautiful dress — it's about the experience of finding it.",
            "At the Fely Campo Ateliers, specialists in eveningwear collections, we make a point of getting to know each madrina and mother of the bride; understanding the type of ceremony and her taste is part of the process. We carry our designer's philosophy through to our stores in Oviedo and Salamanca: \"I like to get to know the woman I'm going to dress, not disguise her.\""
          ]
        }
      },
      {
        "id": "b27",
        "tipo": "foto",
        "src": "/media/web/img/blog/02-vestidos-de-madrina/fely-campo-blog-vestidos-de-madrina-atelier-madre-novia.webp",
        "alt": "Clienta saliendo del Atelier Fely Campo con bolsas de la marca",
        "pie": {
          "es": "En el Atelier de Fely Campo.",
          "en": "At the Fely Campo Atelier."
        }
      },
      {
        "id": "b28",
        "tipo": "texto",
        "texto": {
          "es": [
            "Lo más importante para nosotros, por encima del protocolo al vestir a la madrina de boda o madre de la novia, es la naturalidad; porque es ahí donde una mujer se siente guapa y puede mostrar toda su elegancia con su vestido de madrina o de madre de la novia. La naturalidad unida a un buen patrón, que favorezca su silueta harán que, de manera discreta, todos los invitados de la boda alaben el estilismo de una madrina que muestra su personalidad con su elección.",
            "Visita los Ateliers de Salamanca y Oviedo en el centro de las ciudades, para dejar que te asesoremos con tu vestido de madrina. Siente la complicidad con el equipo de Fely Campo para encontrar tu VESTIDO DE MADRINA O MADRE DE LA NOVIA ideal. Un equipo con años de experiencia que te guiará y te hará vivir un sueño.",
            "Suscríbete a nuestro canal de YouTube para sumergirte en el maravilloso mundo de Fely Campo y seguir de cerca su participación en grandes eventos."
          ],
          "en": [
            "What matters most to us, above and beyond protocol, when dressing the wedding madrina or the mother of the bride, is naturalness — because that's where a woman feels beautiful and can show off all her elegance in her dress. Naturalness combined with a well-crafted pattern that flatters her figure will mean that, quietly, every guest at the wedding will admire the look of a madrina who shows off her personality through her choice.",
            "Visit our Ateliers in the centre of Salamanca and Oviedo and let us advise you on your madrina dress. Feel the connection with the Fely Campo team as you find your ideal MADRINA OR MOTHER-OF-THE-BRIDE DRESS. A team with years of experience who will guide you and help you live a dream.",
            "Subscribe to our YouTube channel to immerse yourself in the wonderful world of Fely Campo and follow her closely at major events."
          ]
        }
      }
    ]
  },
  {
    "slug": "vestidos-de-damas-de-honor-2",
    "publicado": true,
    "fecha": "2021-11-20",
    "imagenCubierta": "/media/web/img/blog/03-vestidos-de-damas-honor/fely-campo-blog-vestidos-de-damas-honor-portada-damashonor.webp",
    "titulo": {
      "es": "Vestidos de damas de honor",
      "en": "Bridesmaid dresses"
    },
    "resumen": {
      "es": "Quién es la dama de honor, cómo elegir su vestido y qué dice la tradición frente a la tendencia: la guía de Fely Campo para un cortejo con personalidad.",
      "en": "Who the bridesmaid is, how to choose her dress, and tradition versus trend: Fely Campo's guide to a bridal party full of personality."
    },
    "bloques": [
      {
        "id": "b1",
        "tipo": "subtitulo",
        "texto": {
          "es": "Quién es la dama de honor en una boda",
          "en": "Who is the bridesmaid at a wedding"
        }
      },
      {
        "id": "b2",
        "tipo": "texto",
        "texto": {
          "es": [
            "La aparición de la figura de la dama de honor de una boda se remonta más allá de la Edad Media, instituyéndose en Europa en los países cristianos. Así, la dama de honor era, por lo general, una niña menor de 12 años y emparentada directamente con la novia. En las bodas cristianas la dama de honor era quien abría el cortejo, delante de la novia, en su camino hacia el altar de la iglesia.",
            "Con el tiempo esa niña pasó a ser un grupo de amigas cercanas a la novia o a la pareja, que hacían las veces de anfitrionas y cómplices y colaboraban con la novia velando en todo momento por la satisfacción de los invitados a la boda.",
            "Además, se vestían todas de manera idéntica, en ocasiones, muy parecidas a la de la novia, porque según las supersticiones, así la protegerían de los malos espíritus que quisieran hacerle algún tipo de daño. De ahí que en la actualidad las damas de honor de una misma boda lleven un vestido muy similar entre ellas."
          ],
          "en": [
            "The figure of the wedding bridesmaid dates back even further than the Middle Ages, becoming established in the Christian countries of Europe. Back then, the bridesmaid was usually a girl under 12, a close relative of the bride. At Christian weddings, the bridesmaid was the one who led the procession, walking ahead of the bride on her way to the altar.",
            "Over time, that little girl became a group of close friends of the bride or the couple, who acted as hostesses and confidantes, helping the bride make sure the wedding guests were well looked after at every moment.",
            "They also all dressed identically, at times very similarly to the bride herself, because according to superstition this would protect her from evil spirits wishing her harm. That's where the modern custom comes from of a wedding's bridesmaids wearing very similar dresses to one another."
          ]
        }
      },
      {
        "id": "b3",
        "tipo": "subtitulo",
        "texto": {
          "es": "Damas de honor en la actualidad",
          "en": "Bridesmaids today"
        }
      },
      {
        "id": "b4",
        "tipo": "texto",
        "texto": {
          "es": [
            "Como ya lo adelantábamos, poco a poco la figura de la niña o de una chica menor y familiar de la novia se convirtió en a un grupo de mujeres, amigas íntimas o familiares de la novia. Normalmente el grupo de damas de honor lo componen entre 4 y 8 chicas, número que podrá variar según las preferencias de la novia.",
            "Hoy día las damas de honor son esas personas de confianza, elegidas por la novia para que la acompañen en todo el proceso que conlleva una boda: desde la involucración en los preparativos, que tienen lugar semanas y a veces hasta meses antes del evento, pasando por la disposición de los invitados en las mesas, hasta resolver cualquier contratiempo.",
            "En España no es muy frecuente ver cortejos de damas de honor. Es una costumbre anglosajona que forma parte de las bodas que se celebren en Inglaterra, Australia y Estados Unidos. Además de la implicación en los detalles previos al enlace, las damas de honor comparten entre ellas y con la novia momentos trascendentales como el de su preparación personal: elección del vestido de dama de honor, maquillaje, peinados…",
            "Por este motivo es fundamental elegir a una persona con la que la novia se sienta cómoda y que le aporte tranquilidad y confianza, porque será quien la acompañe y con quien comparta momentos emotivos en su gran día.",
            "Además, esa niña, de la que nació el rol de dama de honor, sigue apareciendo en las bodas con una misión muy distinta pero no por ello menos notable: llevar los anillos y arras (generalmente acompañada por otra damita u otro niño pequeño), anteceden a la novia en su paseíllo de entrada al altar en el caso de las ceremonias religiosas, o en el encuentro con el oficiante cuando se trata de ceremonias civiles."
          ],
          "en": [
            "As we mentioned, the figure of the young girl and relative of the bride gradually became a group of women, close friends or family members of the bride. The group of bridesmaids is usually made up of between 4 and 8 women, though that number can vary depending on the bride's preferences.",
            "Today, bridesmaids are the trusted people chosen by the bride to accompany her through the whole process of getting married: from getting involved in the preparations, which take place weeks and sometimes months before the event, to seating the guests, to sorting out any last-minute hiccup.",
            "In Spain it's not very common to see a full bridesmaid party. It's an Anglo-Saxon custom, typical of weddings in England, Australia and the United States. Beyond their involvement in the details leading up to the wedding, bridesmaids share meaningful moments with each other and with the bride, such as getting ready together: choosing the bridesmaid dress, doing make-up, hairstyles…",
            "That's why it's essential to choose someone the bride feels comfortable with, who brings her a sense of calm and trust, since this is the person who will be by her side and share emotional moments with her on her big day.",
            "And the little girl who originally inspired the role of bridesmaid still appears at weddings today, with a very different but no less notable mission: carrying the rings and arras coins (usually alongside another little girl or boy), walking ahead of the bride down the aisle at religious ceremonies, or ahead of her when meeting the officiant at civil ceremonies."
          ]
        }
      },
      {
        "id": "b5",
        "tipo": "subtitulo",
        "texto": {
          "es": "Elección de los vestidos de damas de honor",
          "en": "Choosing the bridesmaid dresses"
        }
      },
      {
        "id": "b6",
        "tipo": "texto",
        "texto": {
          "es": [
            "Ser elegida como dama de honor será un verdadero reconocimiento y una muestra de cariño y aprecio especial de la novia hacia la elegida.",
            "Una vez que está decidido quiénes formarán parte del cortejo de damas de honor, llega la hora de elegir el vestido de dama de honor. Por norma general la encargada de esta elección, así como la de los complementos para los vestidos de dama de honor, es la novia. Y como no se trata de un grupo de invitadas cualquiera, la novia se deberá esmerar en hacer que sus damas de honor que luzcan absolutamente elegantes y estilosas el día de la boda.",
            "No cabe duda, el vestido de las damas de honor será uno de los focos de atención del resto de invitados a la boda, después del vestido de novia, y junto con el de vestido de madrina y el de madre de la novia. Estos deberían ser acordes al tipo de vestido de la novia. Por ejemplo, si una novia ha elegido un vestido de novia de corte griego, el vestido de sus damas de honor no sería apropiado si fuera de estilo sexy… y viceversa."
          ],
          "en": [
            "Being chosen as a bridesmaid is a real honour, and a sign of the bride's special affection and appreciation for the person chosen.",
            "Once it's settled who will be part of the bridal party, it's time to choose the bridesmaid dress. As a rule, it's the bride who takes charge of this choice, along with the accessories for the bridesmaid dresses. And since this isn't just any group of guests, the bride should take real care to make sure her bridesmaids look absolutely elegant and stylish on the wedding day.",
            "There's no doubt the bridesmaid dresses will be one of the other guests' main points of attention, after the wedding dress, alongside the madrina's dress and the mother of the bride's dress. These should be in keeping with the style of the bride's dress. For example, if a bride has chosen a Grecian-cut wedding dress, a sexy-style bridesmaid dress wouldn't be a good match… and vice versa."
          ]
        }
      },
      {
        "id": "b7",
        "tipo": "subtitulo",
        "texto": {
          "es": "Tradición o tendencia",
          "en": "Tradition or trend"
        }
      },
      {
        "id": "b8",
        "tipo": "texto",
        "texto": {
          "es": [
            "A continuación unas nociones sobre lo que marcan las tradiciones y sobre lo que está de moda con respecto a los vestidos de damas de honor.",
            "Si hablamos de un estilo más tradicional de cortejo de damas de honor, estas pueden llevar un vestido idéntico todas ellas, de un mismo estilo y color, con accesorios parecidos y peinadas de manera similar, casi imitando a la novia."
          ],
          "en": [
            "Here are a few notes on what tradition dictates and what's currently in fashion when it comes to bridesmaid dresses.",
            "If we're talking about a more traditional style of bridal party, the bridesmaids can all wear an identical dress, in the same style and colour, with similar accessories and hairstyles, almost mirroring the bride."
          ]
        }
      },
      {
        "id": "b9",
        "tipo": "foto",
        "src": "/media/web/img/blog/03-vestidos-de-damas-honor/fely-campo-blog-vestidos-de-damas-honor-jaime-s-1.webp",
        "alt": "Vestidos de damas de honor. Fotografía de Jaime S.",
        "pie": {
          "es": "Vestidos de damas de honor. Fotografía de Jaime S.",
          "en": "Bridesmaid dresses. Photograph by Jaime S."
        }
      },
      {
        "id": "b10",
        "tipo": "texto",
        "texto": {
          "es": [
            "Otra alternativa es escoger un mismo modelo pero que cada una luzca un color diferente o bien proponer dos colores distintos que combinen y que cada dama de honor escoja el que prefiera."
          ],
          "en": [
            "Another option is to choose a single style but have each bridesmaid wear a different colour, or offer two colours that go well together and let each bridesmaid pick her favourite."
          ]
        }
      },
      {
        "id": "b11",
        "tipo": "foto",
        "src": "/media/web/img/blog/03-vestidos-de-damas-honor/fely-campo-blog-vestidos-de-damas-honor-bodas-1.webp",
        "alt": "Dos damas de honor con vestidos de distinto color, verde y rosa",
        "pie": {
          "es": "Vestidos de dama de honor en distintos colores.",
          "en": "Bridesmaid dresses, each a different colour."
        }
      },
      {
        "id": "b12",
        "tipo": "texto",
        "texto": {
          "es": [
            "Hay versiones en las que una vez elegido un color y un tejido, se deja a criterio de cada una, el modelo de vestido de dama de honor que lucirá ese día."
          ],
          "en": [
            "There are also versions where, once a colour and fabric have been chosen, each bridesmaid is free to decide which style of dress she'll wear on the day."
          ]
        }
      },
      {
        "id": "b13",
        "tipo": "foto",
        "src": "/media/web/img/blog/03-vestidos-de-damas-honor/fely-campo-blog-vestidos-de-damas-honor-juankar-foto.webp",
        "alt": "Vestidos de dama de honor estampados",
        "pie": {
          "es": "Vestidos de dama de honor estampados.",
          "en": "Printed bridesmaid dresses."
        }
      },
      {
        "id": "b14",
        "tipo": "foto",
        "src": "/media/web/img/blog/03-vestidos-de-damas-honor/fely-campo-blog-vestidos-de-damas-honor-juankar-foto-2.webp",
        "alt": "Vestidos de dama de honor elegantes, fotografiados por Juankar Foto",
        "pie": {
          "es": "Vestidos de dama de honor elegantes, fotografiados por Juankar Foto.",
          "en": "Elegant bridesmaid dresses, photographed by Juankar Foto."
        }
      },
      {
        "id": "b15",
        "tipo": "texto",
        "texto": {
          "es": [
            "En ocasiones hay novias muy detallistas, que prefieren que la tonalidad del vestido de las damas de honor sintonice con el color de la decoración de la boda, con el del ramo de novia o con algún otro complemento incluido en su look nupcial, como el velo o los zapatos.",
            "Puede que los vestidos de dama de honor cortos estén marcando tendencia, pero son los vestidos de dama de honor largos los que siguen siendo los favoritos por la mayoría de novias e invitadas de boda, independientemente de que la celebración sea durante el día o de que se trate de una boda de noche o al caer la tarde",
            "En líneas generales y en lo que se refiere a colores, no hay nada escrito. Los colores que más suelen demandar para vestidos de dama de honor son todos los tonos pasteles, el dorado y el plata, el nude… Entre los más populares están los vestidos de dama de honor rosa, los vestidos de dama de honor azul y los vestidos de dama de honor malva.",
            "Respecto al estilo de los vestidos de damas de honor, te recomendamos que no pierdas de vista otros factores a tener en cuenta:",
            "– Cada dama de honor debería vestirse de acuerdo a su propia personalidad y estilo, no sentirse disfrazada.",
            "– Los vestidos de damas de honor deberán ir acordes con la estación del año en la que se celebrará el enlace.",
            "– Anteponer la comodidad que sentirán con su vestido de dama de honor a cualquier otro aspecto, de forma que todas se sientan cómodas el gran día."
          ],
          "en": [
            "Sometimes there are very detail-oriented brides who prefer the shade of the bridesmaid dresses to match the colour of the wedding decor, the bridal bouquet, or some other element of her own bridal look, such as the veil or the shoes.",
            "Short bridesmaid dresses may be setting the trend, but long bridesmaid dresses remain the favourite for most brides and wedding guests, regardless of whether the celebration takes place during the day, in the evening, or at dusk.",
            "Broadly speaking, when it comes to colour, anything goes. The most requested shades for bridesmaid dresses are pastel tones of every kind, gold and silver, nude… Among the most popular are pink bridesmaid dresses, blue bridesmaid dresses and mauve bridesmaid dresses.",
            "As for the style of the bridesmaid dresses, we recommend you keep a few other factors in mind:",
            "– Each bridesmaid should dress in keeping with her own personality and style, never feeling like she's in a costume.",
            "– Bridesmaid dresses should suit the season of the year in which the wedding will take place.",
            "– Put the comfort they'll feel in their bridesmaid dress above any other consideration, so that everyone feels comfortable on the big day."
          ]
        }
      },
      {
        "id": "b16",
        "tipo": "subtitulo",
        "texto": {
          "es": "Vestidos de damas de honor a medida",
          "en": "Made-to-measure bridesmaid dresses"
        }
      },
      {
        "id": "b17",
        "tipo": "texto",
        "texto": {
          "es": [
            "Como ya lo mencionamos, muchas novias deciden que sus damas de honor lleven vestidos con el mismo tono, tipo de tela y largo, y que cada una de ellas personalice el corte que más le favorezca a su cuerpo y con el que más cómoda estará durante todo el evento.",
            "Lo más coherente y sencillo es que, si ya se ha apostado por el asesoramiento personalizado, en cuanto se refiere a la confección del vestido de novia, se permita a los mismos profesionales de un atelier de novias, que tienen también atelier de invitada, trabajar sobre los vestidos de damas de honor que las acompañantes más íntimas lucirán en exclusiva el día de la gran celebración.",
            "Consideramos que este es un gesto bonito y elegante con el cual las novias pueden agasajar y complacer a su cortejo de damas de honor. Como muestra de respeto por esa relación tan importante y el papel que se quiere que desempeñe el día de la boda, las damas de honor merecen destacarse entre la multitud de otros amigos y familiares. ¡Y sin duda esta es para nosotros la opción más acertada!"
          ],
          "en": [
            "As we mentioned, many brides decide their bridesmaids should wear dresses in the same tone, fabric and length, while each one personalises the cut that best suits her body and that she'll feel most comfortable in throughout the event.",
            "The most sensible and straightforward approach, if you've already chosen personalised guidance for the wedding dress itself, is to let the same professionals at a bridal atelier that also runs a guest atelier work on the bridesmaid dresses that your closest companions will wear exclusively on the big day.",
            "We believe this is a lovely, elegant gesture through which brides can treat and delight their bridesmaids. As a sign of respect for such an important relationship and the role they're meant to play on the wedding day, bridesmaids deserve to stand out among the many other friends and family members. And for us, this is without a doubt the best option!"
          ]
        }
      },
      {
        "id": "b18",
        "tipo": "subtitulo",
        "texto": {
          "es": "Damas de honor Fely Campo",
          "en": "Fely Campo bridesmaids"
        }
      },
      {
        "id": "b19",
        "tipo": "texto",
        "texto": {
          "es": [
            "La idea de que la novia y sus damas de honor asistan juntas a la elección y confección de sus vestidos, aumenta la emoción del evento y suma instantes únicos y emocionalmente intensos entre la novia y sus compañeras más incondicionales."
          ],
          "en": [
            "The idea of the bride and her bridesmaids attending the choosing and making of their dresses together heightens the excitement of the whole process and adds unique, emotionally intense moments between the bride and her most steadfast companions."
          ]
        }
      },
      {
        "id": "b20",
        "tipo": "foto",
        "src": "/media/web/img/blog/03-vestidos-de-damas-honor/fely-campo-blog-vestidos-de-damas-honor-manuel-laya.webp",
        "alt": "Vestidos de damas de honor 2020. Fotografía de Manuel Laya",
        "pie": {
          "es": "Vestidos de damas de honor 2020. Fotografía de Manuel Laya.",
          "en": "Bridesmaid dresses 2020. Photograph by Manuel Laya."
        }
      },
      {
        "id": "b21",
        "tipo": "texto",
        "texto": {
          "es": [
            "Fely Campo lleva desde 1994 dedicándose a la producción de diseños de alta costura y a la creación de una atmósfera de complicidad que buscan las novias, madrinas, invitadas de boda y sus damas de honor para disfrutar de la creación de sus prendas: vestidos para ceremonias, vestidos de fiesta, vestidos de novia, vestidos de madrina de boda y, por supuesto, vestidos de damas de honor.",
            "Teniendo en cuenta que cada mujer y cada cuerpo de las damas de honor son diferentes, nosotros sabremos jugar con el patrón para que cada una de ellas haciendo variaciones en cortes, variaciones de escote y detalles en el vestido para que a cada una se saque el mayor partido. Adaptaremos el estilo perfecto para cada una de las damas de honor, manteniendo la armonía con el vestido de la novia, con el resto de damas de honor y con la temática de la boda.",
            "Si tienes planes de boda, acierta solicitando desde ya una cita en cualquiera de los ateliers de invitada de Fely Campo para que, en una primera toma de contacto, expongas tus ideas sobre el vestido de dama de honor con el que quieres que tu cortejo deslumbre tanto como tú. Y ella o su equipo de profesionales con años de experiencia, te asesorará para que ese día luzcas el vestido de dama de honor perfecto para ti.",
            "Visita nuestro canal de YouTube para que sigas de cerca lo que hace Fely Campo dentro y fuera de nuestro país."
          ],
          "en": [
            "Fely Campo has been producing haute couture designs since 1994, creating the atmosphere of trust and closeness that brides, madrinas, wedding guests and their bridesmaids look for when it comes to enjoying the creation of their garments: ceremony dresses, eveningwear, wedding dresses, madrina dresses and, of course, bridesmaid dresses.",
            "Since every woman and every bridesmaid's body is different, we know how to work with the pattern for each one of them, varying the cut, the neckline and the details of the dress to get the very best out of each figure. We'll tailor the perfect style for every bridesmaid, while keeping it in harmony with the bride's dress, the rest of the bridesmaids, and the theme of the wedding.",
            "If you're planning a wedding, make the smart choice and book an appointment now at any of Fely Campo's guest ateliers, so that, in a first meeting, you can share your ideas for the bridesmaid dress you want your bridal party to dazzle in, just like you. She, or her team of professionals with years of experience, will guide you so that on the day you wear the perfect bridesmaid dress for you.",
            "Visit our YouTube channel to keep up close with what Fely Campo is doing, both at home and abroad."
          ]
        }
      }
    ]
  }
];

export const EPISODIOS = [
  {
    "slug": "podcast-01-crear-sin-pedir-permiso",
    "publicado": true,
    "titulo": {
      "es": "Crear sin pedir permiso",
      "en": "Creating without asking permission"
    },
    "enlace": "https://www.youtube.com/watch?v=umjhdRoup1w",
    "imagenCubierta": "/media/web/img/collections/runway/fw27-lacoleccion/backstage/fely-campo-pasarela-la-coleccion-backstage-framae-studio-036.webp",
    "duracion": "34 min"
  }
];
