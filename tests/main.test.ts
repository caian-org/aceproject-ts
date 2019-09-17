test('first test', (): void => {
    expect.assertions(1);
    expect('Test'.toLowerCase()).toStrictEqual('test');
});
