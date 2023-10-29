module.exports = {
  title: `다정한 원칙`,
  description: `정해진 원칙에 대한 고찰과 여러 경험들을 다정하게 기록합니다. 개발자로 필요한 원칙들을 정리해갑니다.`,
  language: `ko`, // `ko`, `en` => currently support versions for Korean and English
  siteUrl: `https://her0807.com`,
  ogImage: `/og-image.png`, // Path to your in the 'static' folder
  comments: {
    utterances: {
      repo: `https://github.com/her0807/her0807.github.io`, // `zoomkoding/zoomkoding-gatsby-blog`,
    },
  },
  ga: '0', // Google Analytics Tracking ID
  author: {
    name: `허수진`,
    bio: {
      role: `백엔드 개발자`,
      description: ['대화가 즐거운', '배움 가득한', '고민이 많은'],
      thumbnail: 'sudal_profile.gif', // Path to the image in the 'asset' folder
    },
    social: {
      github: `https://github.com/her0807`, // `https://github.com/her0807`,
      linkedIn: ``, // `https://www.linkedin.com/in/jinhyeok-jeong-800871192`,
      email: `sujin9887@gmail.com`, // `zoomkoding@gmail.com`,
    },
  },

  // metadata for About Page
  about: {
    timestamps: [
      // =====       [Timestamp Sample and Structure]      =====
      // ===== 🚫 Don't erase this sample (여기 지우지 마세요!) =====
      {
        date: '',
        activity: '',
        links: {
          github: '',
          post: '',
          googlePlay: '',
          appStore: '',
          demo: '',
        },
      },
      // ========================================================
      // ========================================================

    ],

    projects: [
      // =====        [Project Sample and Structure]        =====
      // ===== 🚫 Don't erase this sample (여기 지우지 마세요!)  =====
      {
        title: '',
        description: '',
        techStack: ['', ''],
        thumbnailUrl: '',
        links: {
          post: '',
          github: '',
          googlePlay: '',
          appStore: '',
          demo: '',
        },
      },
      // ========================================================
      // ========================================================

    ],
  },
};
