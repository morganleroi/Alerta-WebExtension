beforeEach(() => {
    global.chrome.windows = {
        update: jest.fn()
    } as any;

    jest.clearAllMocks();
});

test('Should do something', () => {
   
});